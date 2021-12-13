import FileType from "../../FileType";
import ResourceStruct from "../ResourceStruct";
import ResourceType from "../ResourceType";
import AbstractResourceParser from "./AbstractResourceParser";
import { Texture, BaseTexture, Sprite, Point } from "pixi.js";
import { property } from "lodash";

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

    guard( contentStruct ) {
        return contentStruct.type === FileType.ATLAS;
    }
    
    parse( contentStruct ) {
        this.resourceCreate( contentStruct );
        this.atlasParse();
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
            // const texture = 
        }
    }



    //
    // ATLAS
    //

    atlasParse() {
        this.spineAtlasStruct = {
            ... SpineAtlasStruct,
            name: this.resourceStruct.name,
            sourceNameList: this._resourceSpineAtlasFileNamesGet( this.resourceStruct.contentStruct ),
            atlasStructList: this._atlasStructListGet( this.resourceStruct.contentStruct )
        }
    }

    _atlasStructListGet( contentStruct ) {
        const atlasStructList = [];

        const LINE_NEW = "\n";
        const PROP_DIVIDER = ": ";
        const REGION_PROP_PREFIX = "  ";

        let positionLine = 0;
        let positionLineFirst = 0;
        let positionLineLast = 0;
        let nameLength = 0;
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
                atlas = {
                    ...AtlasStruct,
                    name: line,
                    textureStructList: []
                };

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
                texture = {
                    ... TextureStruct,
                    name: line
                };

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

    _resourceSpineAtlasFileNamesGet( contentStruct ) {
        const LINE_NEW = "\n";
        const list = [];

        let positionLine = 0;
        let positionLineFirst = 0;
        let positionLineLast = 0;
        let nameLength = 0;
        let divider = LINE_NEW;

        while (true) {
            if (positionLine > 0) divider = LINE_NEW + LINE_NEW;
            positionLine = contentStruct.result.indexOf(divider, positionLine);
            if (positionLine < 0) break;

            positionLineFirst = positionLine + divider.length;
            positionLineLast = contentStruct.result.indexOf(LINE_NEW, positionLineFirst);
            nameLength = positionLineLast - positionLineFirst;

            if (nameLength > 0 && nameLength < 256) {
                list.push( contentStruct.result.substring( positionLineFirst, positionLineLast ) );
                positionLine = positionLineLast + 1;
            } else {
                break;
            }
        }

        return list;
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