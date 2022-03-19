import FileType from "../../FileType";
import ResourceStruct from "../ResourceStruct";
import ResourceType from "../ResourceType";
import AbstractResourceParser from "./AbstractResourceParser";
import { Texture, Point, Rectangle } from "pixi.js";

export default class ResourceSpineAtlasParser extends AbstractResourceParser {

    get resourceRequireNameList() {
        const list = [];

        for ( let i = 0; i < this.resourceRequireSourceNameList.length; i++ ) {
            const name = this.resourceRequireSourceNameList[ i ];
            let inList = false;
            for ( let j = 0; j < this.resourceStruct.resourceStructList.length; j++ ) {
                const resourceStruct = this.resourceStruct.resourceStructList[ j ];
                if ( resourceStruct.contentStruct.file.name !== name ) continue;
                inList = true;
                break;
            }

            if ( inList ) continue;
            list.push( name );
        }

        return list; 
    }

    get resourceRequireSourceNameList() {
        return this.spineAtlasStruct.sourceNameList;
    }

    get isResourcesReady() {
        return this.resourceRequireNameList.length === 0;
    }

    get atlas() {
        return this.resourceStruct.instance;
    }

    get atlasTextureData() {
        return this._atlasTextureData;
    }

    guard( contentStruct ) {
        return contentStruct.type === FileType.ATLAS;
    }
    
    parse( contentStruct ) {
        this.resourceCreate( contentStruct );
        this.atlasParse();
        this.atlasTextureDataInit();
    }

    resourceCreate( contentStruct ) {
        this.resourceStruct = {
            ... ResourceStruct,
            ready: false,
            name: contentStruct.name,
            type: ResourceType.ATLAS,
            instance: undefined,
            contentStruct,
            resourceStructList: []
        };
        return this.resourceStruct;
    }

    resourceRequireSet( resourceStruct ) {
        this._resourceRequireAdd( resourceStruct );
        this.texturesParse();
        this.atlasCreate();
        this.resourceReady( this.resourceStruct );
    }


    //
    // TEXTURES
    //

    texturesParse() {
        if ( !this.isResourcesReady ) return;
        this.texturesCreateAll();
    }

    texturesCreateAll() {
        for ( let i = 0; i < this.resourceStruct.resourceStructList.length; i++ ) {
            const imageResourceStruct = this.resourceStruct.resourceStructList[ i ];
            const texture = imageResourceStruct.instance.texture;
            const atlasStruct = this._atlasStructByFileNameGet( imageResourceStruct.contentStruct.file.name );
            this._texturesByAtlasStructCreate( atlasStruct, texture );
        }
    }

    _texturesByAtlasStructCreate( atlasStruct, source ) {
        if ( !atlasStruct ) return;
        for ( let i = 0; i < atlasStruct.textureStructList.length; i++ ) {
            const textureStruct = atlasStruct.textureStructList[ i ];
            this._textureCreate( textureStruct, source );
        }
    }

    _textureCreate( textureStruct, source ) {
        if ( !textureStruct ) return;

        const width = textureStruct.rotate ? textureStruct.size.y : textureStruct.size.x;
        const height = textureStruct.rotate ? textureStruct.size.x : textureStruct.size.y;
        const frame = new Rectangle( textureStruct.xy.x, textureStruct.xy.y, width, height );
        const rotate = textureStruct.rotate ? 2 : 0;
        const texture = new Texture( source, frame, undefined, undefined, rotate );

        this._atlasTextureData[ textureStruct.name ] = texture;
    }



    //
    // ATLAS
    //

    atlasParse() {
        const atlasStructList = this._atlasStructListGet( this.resourceStruct.contentStruct )
        const sourceNameList = atlasStructList.map( atlas => atlas.name );

        this.spineAtlasStruct = {
            ... SpineAtlasStruct,
            name: this.resourceStruct.name,
            sourceNameList,
            atlasStructList
        };
    }

    atlasCreate() {
        const atlas = new TextureAtlas();
        atlas.addTextureHash( this.atlasTextureData, false );
        this.resourceStruct.instance = atlas;
    }

    atlasTextureDataInit() {
        this._atlasTextureData = { };
    }

    _atlasStructByFileNameGet( name ) {
        for ( let i = 0; i < this.spineAtlasStruct.atlasStructList.length; i++ ) {
            const atlasStruct = this.spineAtlasStruct.atlasStructList[ i ];
            if ( atlasStruct.name !== name ) continue;
            return atlasStruct;
        }
        return undefined;
    }

    _atlasStructListGet( contentStruct ) {
        const atlasStructList = [];

        const LINE_NEW = "\n";
        const PROP_DIVIDER = ": ";
        const REGION_PROP_PREFIX = "  ";

        let positionLine = 0;
        let positionLineLast = 0;
        let atlas = undefined;
        let texture = undefined;
        let line = undefined;
        let aa = 0;

        while ( true ) {
            positionLine = contentStruct.result.indexOf( LINE_NEW, positionLine );
            line = contentStruct.result.substring( positionLineLast, positionLine );
            if ( positionLine === -1 ) {
                if ( atlas ) {
                    if ( texture ) atlas.textureStructList.push( texture );
                    atlasStructList.push( atlas );
                }
                break;
            }

            if ( aa > 10000) {
                debugger;
                break;
            }

            if ( line === undefined ) {
                debugger;
            } else if ( line === "" ) {
                if ( atlas !== undefined ) {
                    if ( texture ) atlas.textureStructList.push( texture );
                    atlasStructList.push( atlas );
                }
                atlas = undefined;
                texture = undefined;
            } else if ( !atlas ) {
                atlas = { ...AtlasStruct, name: line, textureStructList: [] };

            // Atlas property
            } else if ( line.indexOf( REGION_PROP_PREFIX ) === -1 && line.indexOf( PROP_DIVIDER ) > 0 ) {
                const property = this._atlasPropertyGet( line );
                if ( property === undefined ) debugger;
                atlas[ property.name ] = property.value;

            // Texture name
            } else if ( line.indexOf( REGION_PROP_PREFIX ) === -1 && line.indexOf( PROP_DIVIDER ) === -1 ) {
                if ( texture ) {
                    atlas.textureStructList.push( texture );
                }
                texture = { ... TextureStruct, name: line };

            // texture property
            } else if ( line.indexOf( REGION_PROP_PREFIX ) >= 0 && line.indexOf( PROP_DIVIDER ) > 0 ) {
                const property = this._atlasPropertyGet( line );
                if ( property === undefined ) debugger;
                texture[ property.name ] = property.value;
            }

            positionLine += 1;
            positionLineLast = positionLine;
            aa += 1;
        }

        return atlasStructList;
    }

    _atlasPropertyGet( line ) {
        const PROP_DIVIDER = ": ";
        const REGION_PROP_PREFIX = "  ";
        const nameStart = line.indexOf( REGION_PROP_PREFIX, 0 );
        const valueStart = line.indexOf( PROP_DIVIDER, 0 );
        if ( valueStart === -1 ) {
            debugger
        }

        const name = line.substring( nameStart === 0 ? 2 : 0, valueStart );
        const result = line.substring( valueStart + PROP_DIVIDER.length, line.length );
        const pointIndex = result.indexOf( "," );
        let value = undefined;

        if ( pointIndex > 0 ) {
            value = new Point( parseInt( result.substring( 0, pointIndex ) ), parseInt( result.substring( pointIndex + 1, result.length ) ) );
        } else if ( result.indexOf( "true" ) >= 0 || result.indexOf( "false" ) >= 0 ) {
            value = result.indexOf( "true" ) >= 0;
        } else if ( !isNaN( parseInt( result ) ) ) {
            value = parseInt( result );
        } else {
            value = result;
        }

        return value !== undefined ? { name, value } : undefined;
    }



    //
    // RESOURCE TECH
    //

    _resourceRequireAdd( resourceStruct ) {
        const index = this.resourceStruct.resourceStructList.indexOf( resourceStruct );
        if ( index >= 0) return;
        this.resourceStruct.resourceStructList.push( resourceStruct );

        console.log("ResourceSpineAtlasParser: ", resourceStruct.name, " ADD");
    }

}

const SpineAtlasStruct = {
    name: undefined,
    sourceNameList: [],
    atlasStructList: []
}

const AtlasStruct = {
    name: undefined,
    size: undefined,            // size: 2048,2048
    format: undefined,          // format: RGBA8888
    filter: "Linear,Linear",    // filter: Linear,Linear
    repeat: "none",             // repeat: none
    textureStructList: []
}

const TextureStruct = {
    name: undefined,
    rotate: false,              // rotate
    xy: undefined,              // xy: 2, 144
    size: undefined,            // size: 1149, 171
    orig: undefined,            // orig: 1183, 228
    offset: undefined,          // offset: 0, 14
    index: -1                   // index: -1
};