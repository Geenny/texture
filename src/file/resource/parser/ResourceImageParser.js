import FileType from "../../FileType";
import ResourceStruct from "../ResourceStruct";
import ResourceType from "../ResourceType";
import AbstractResourceParser from "./AbstractResourceParser";
import { Texture, BaseTexture, Sprite } from "pixi.js";

export default class ResourceImageParser extends AbstractResourceParser {

    guard( contentStruct ) {
        return contentStruct.type === FileType.JPG ||
            contentStruct.type === FileType.PNG;
    }

    parse( contentStruct ) {
        this.resourceCreate( contentStruct );
        this.instanceCreate( contentStruct );
    }

    resourceCreate( contentStruct ) {
        this.resourceStruct = {
            ... ResourceStruct,
            ready: false,
            name: contentStruct.name,
            type: ResourceType.IMAGE,
            instance: undefined,
            contentStruct,
            resourceStructList: []
        };
        return this.resourceStruct;
    }

    instanceCreate( contentStruct ) {
        const image = new Image();
        this.instanceOnLoad = this.instanceOnLoad.bind( this );

        image.addEventListener( "load", this.instanceOnLoad );
        image.src = contentStruct.result;
    }

    instanceOnLoad( event ) {
        const image = event.target;
        const baseTexture = new BaseTexture( image );
        const texture = new Texture( baseTexture );
        Texture.addToCache( texture, this.resourceStruct.name );

        this.resourceStruct.instance = new Sprite( texture );
        this.resourceStruct.ready = true;

        image.removeEventListener( "load", this.instanceOnLoad );

        this.resourceReady( this.resourceStruct );
    }

}