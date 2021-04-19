import { BaseTexture, Texture } from "pixi.js";
import EventDispathcer from "../../event/EventDispatcher.js";
import ContentDropGrabber from "./ContentDropGrabber.js";
import ContentDropEvent from "./ContentDropEvent.js";
import ResourceStruct from "./ResourceStruct.js";
import ResourceType from "./ResourceType.js";
import FileType from "../FileType.js";
import ResourceEvent from "./ResourceEvent.js";

export default class ContentManager extends EventDispathcer {

    constructor() {
        super();
        this.init();
    }

    init() {
        this._initVars();
        this._contentDropGrabberInit();
    }

    _initVars() {
        this._contentStructList = [];
        this._resourceStructList = [];
    }

    _contentDropGrabberInit() {
        this.onContentLoad = this.onContentLoad.bind( this );

        ContentDropGrabber.init();
        ContentDropGrabber.instance.addEventListener( ContentDropEvent.ONLOAD, this.onContentLoad );
    }

    onContentLoad( event ) {
        const contentStruct = event.contentStruct;
        this.contentStructAdd( contentStruct );
        this.resourcesCheckReady();
    }


    //
    // CONTENT
    //

    contentStructInList( contentStruct ) {
        return this._contentStructList.indexOf( contentStruct ) >= 0;
    }

    contentStructAdd( contentStruct ) {
        if ( !contentStruct || this.contentStructInList( contentStruct ) ) return;
        this._contentStructList.push( contentStruct );
    }


    //
    // RESOURCE
    //

    resourcesCheckReady() {
        this.resourcesParseAll();
        this.resourcesCheckComplete();
    }

    resourcesParseAll() {
        for ( let i = 0; i < this._contentStructList.length; i++ ) {
            const contentStruct = this._contentStructList[ i ];
            this.resourceParse( contentStruct );
        }
    }

    resourcesCheckComplete() {
        for ( let i = 0; i < this._resourceStructList.length; i++ ) {
            const resourceStruct = this._resourceStructList[ i ];
            if ( resourceStruct.ready ) continue;
            // if ( !this.resourceCheckComplete( resourceStruct ) ) continue;
            this.resourceInit( resourceStruct );
        }
    }

    resourceIsSpine( contentStruct ) {
        // const index = this._resourceStructIndexGet( contentStruct );
        // if ( index >= 0 ) return true;

        // const resourceStruct = this.resourceStructByNameGet( contentStruct.name );
        // if ( resourceStruct ) return true;

        if ( contentStruct.type === FileType.JSON ) {
            const json = JSON.parse( contentStruct.result );
            if ( this.checkJSON( json ) ) return true;
        }

        if ( contentStruct.type === FileType.ATLAS ) {
            return true;
        }

        if ( contentStruct.type === FileType.PNG ) {
            return true;
        }

        return false;
    }

    resourceIsImage( contentStruct ) {
        return contentStruct.type === FileType.PNG || contentStruct.type === FileType.JPG;
    }

    resourceParse( contentStruct ) {

        // SPINE
        if ( this.resourceIsSpine( contentStruct ) ) {
            this.resourceStructUpdate( contentStruct, ResourceType.SPINE );
        }
        
        // IMAGE
        if ( this.resourceIsImage( contentStruct ) ) {
            this.resourceStructUpdate( contentStruct, ResourceType.IMAGE );
        }
    }

    resourceStructUpdate( contentStruct, type ) {
        let resourceStruct = this.resourceStructByContentStructGet( contentStruct );
        if ( !resourceStruct ) {
            resourceStruct = this._resourceCreateResource( contentStruct, type );
            resourceStruct.contentStructList.push( contentStruct );
        }
        return resourceStruct;
    }

    resourceStructByNameGet( name ) {
        for ( let i = 0; i < this._resourceStructList.length; i++ ) {
            const resourceStruct = this._resourceStructList[ i ];
            if ( resourceStruct.name === name ) {
                return resourceStruct;
            }
            if ( resourceStruct.name.indexOf( name ) === 0 ) {
                return resourceStruct;
            }
        }
        return null;
    }

    resourceStructByContentStructGet( contentStruct ) {
        let resourceStruct = this._resourceStructFromListGet( contentStruct );

        if ( !resourceStruct ) {
            resourceStruct = this.resourceStructByNameGet( contentStruct.name );
            if ( resourceStruct ) resourceStruct.contentStructList.push( contentStruct );
        }

        return resourceStruct;
    }

    resourceInit( resourceStruct ) {
        if ( resourceStruct.instance ) return;
        if ( !this._resourceStructStart( resourceStruct ) ) return;
        resourceStruct.ready = true;
        this.dispatchEvent( new ResourceEvent( ResourceEvent.COMPLETE, resourceStruct ) );
    }

    _resourceStructFromListGet( contentStruct ) {
        const index = this._resourceStructIndexGet( contentStruct );
        return index >= 0 ? this._resourceStructList[ index ] : null;
    }

    _resourceStructIndexGet( contentStruct ) {
        for ( let i = 0; i < this._resourceStructList.length; i++ ) {
            const resourceStruct = this._resourceStructList[ i ];
            const index = resourceStruct.contentStructList.indexOf( contentStruct );
            if ( index >= 0 ) return i;
        }
        return -1;
    }

    _resourceCreateResource( contentStruct, type ) {
        const resourceStruct = {
            ...ResourceStruct,
            type: type,
            name: contentStruct.name
        };
        this._resourceStructList.push( resourceStruct );
        return resourceStruct;
    }

    _resourceStructStart( resourceStruct ) {
        switch( resourceStruct.type ) {
            case ResourceType.SPINE:
                return this._resourceSpineCreate( resourceStruct );
            case ResourceType.IMAGE:
                return this._resourceImageCreate( resourceStruct );
        }
        return false;
    }

    _resourceContentStructByFileTypeGet( resourceStruct, type ) {
        for ( let i = 0; i < resourceStruct.contentStructList.length; i++ ) {
            const contentStruct = resourceStruct.contentStructList[ i ];
            if ( contentStruct.type != type ) continue;
            return contentStruct;
        }
        return null;
    }


    //
    // SPINE
    //

    checkJSON( jsonData ) {
        if ( !jsonData ) return false;
        if ( !jsonData.skeleton || !jsonData.skeleton.spine ) return false;
        if ( !jsonData.bones || !jsonData.bones.length ) return false;
        if ( !jsonData.slots || !jsonData.slots.length ) return false;
        // if ( !jsonData.animations || !jsonData.animations.length ) return false;
        return true;
    };

    _resourceSpineCreate( resourceStruct ) {
        if ( !this._resourceContentStructByFileTypeGet( resourceStruct, FileType.JSON ) ) return false;
        if ( !this._resourceSpineAtlasCheck( resourceStruct ) ) return false;

        const TextureAtlas = window.PIXI.spine.core.TextureAtlas;
        const AtlasAttachmentLoader = window.PIXI.spine.core.AtlasAttachmentLoader;
        const SkeletonJson = window.PIXI.spine.core.SkeletonJson;
        const Spine = window.PIXI.spine.Spine;

        const contentStructJSON = this._resourceContentStructByFileTypeGet( resourceStruct, FileType.JSON );
        const contentStructAtlas = this._resourceContentStructByFileTypeGet( resourceStruct, FileType.ATLAS );
        const contentStructPNG = this._resourceContentStructByFileTypeGet( resourceStruct, FileType.PNG );
        const spineAtlas = new TextureAtlas( contentStructAtlas.result,
            function( name, callback ) {
                const image = new Image();
                image.src = contentStructPNG.result;
                const myBaseTexture = new BaseTexture(image);
                const texture = new Texture(myBaseTexture);
                Texture.addToCache(texture, name);

                callback(myBaseTexture);
            }
        );

        const spineAtlasLoader = new AtlasAttachmentLoader( spineAtlas );
        const spineJsonParser = new SkeletonJson( spineAtlasLoader );
        const spineData = spineJsonParser.readSkeletonData( contentStructJSON.result );

        const spine = new Spine( spineData );

        resourceStruct.instance = spine;

        return true;
    }
    _resourceSpineAtlasCheck( resourceStruct ) {
        const contentStructAtlas = this._resourceContentStructByFileTypeGet( resourceStruct, FileType.ATLAS );
        if ( !contentStructAtlas ) return false;
        const list = this._resourceSpineAtlasFileNamesGet( contentStructAtlas );
        if ( list.length === 0 ) return false;

        for ( let i = 0; i < resourceStruct.contentStructList.length; i++ ) {
            const contentStruct = resourceStruct.contentStructList[ i ];
            const index = list.indexOf( contentStruct.name );
            if ( contentStruct.type != FileType.PNG || index < 0 ) continue;

            list.splice( index, 1 );
        }

        return list.length === 0;
    }
    _resourceSpineAtlasFileNamesGet( contentStruct ) {
        const list = [];
        let positionOfName = 0;
        let positionPNG = 0;

        while ( true ) {
            positionPNG = contentStruct.result.indexOf( ".png", positionOfName );
            positionOfName = contentStruct.result.indexOf( contentStruct.name, positionOfName );
            if ( positionOfName > 0 && positionOfName + contentStruct.name.length <= positionPNG && positionOfName + contentStruct.name.length + 3 > positionPNG ) {
                list.push( contentStruct.result.substring( positionOfName, positionPNG ) );
                positionOfName = positionPNG + 1;
            } else {
                break;
            }
        }

        return list;
    }

}