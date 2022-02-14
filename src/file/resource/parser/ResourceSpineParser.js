import { AtlasAttachmentLoader, SkeletonJson, Spine } from "@pixi-spine/runtime-3.8";
import { TextureAtlas } from "pixi-spine";
import { Application, Graphics, Texture } from "pixi.js";
import FileType from "../../FileType";
import ResourceStruct from "../ResourceStruct";
import ResourceType from "../ResourceType";
import AbstractResourceParser from "./AbstractResourceParser";

/**
 * https://github.com/pixijs/spine/blob/master/examples/dynamic_texture_atlas.md
 */
export default class ResourceSpineParser extends AbstractResourceParser {

    static get texture() {
        if (!ResourceSpineParser._texture) {
            const graphics = new Graphics();
            graphics.beginFill(0xff0000, 0.2);
            graphics.drawRect(0, 0, 100, 100);
            ResourceSpineParser._texture = Application.application.renderer.generateTexture(graphics, {});
        }
        return ResourceSpineParser._texture;
    }

    get resourceRequireNameList() {
        this.resourceStruct;
        debugger;
        return [];
    }

    guard( contentStruct ) {
        return contentStruct.type === FileType.JSON && this.checkJSONContentStruct( contentStruct )
    }
    
    parse( contentStruct ) {
        this.resourceCreate( contentStruct );
        // this.spineJSONParse();
    }

    resourceCreate( contentStruct ) {
        this.resourceStruct = {
            ... ResourceStruct,
            ready: false,
            name: contentStruct.name,
            type: ResourceType.SPINE,
            instance: undefined,
            contentStruct,
            resourceStructList: []
        };
        return this.resourceStruct;
    }

    checkJSONContentStruct( contentStruct ) {
        const jsonData = this.jsonParseToObjectGet( contentStruct.result );
        if ( !jsonData ) return false;
        if ( !jsonData.skeleton || !jsonData.skeleton.spine ) return false;
        if ( !jsonData.bones || !jsonData.bones.length ) return false;
        if ( !jsonData.slots || !jsonData.slots.length ) return false;
        if ( !jsonData.skins || !jsonData.skins.length ) return false;
        
        return true;
    };

    jsonParseToObjectGet( jsonText ) {
        try {
            return JSON.parse( jsonText );
        } catch (error) {
            console.log( error.toString() );
        }
        
        return {};
    }

    jsonGet() {
        return false;
    }

    spineJSONParse() {
        this.json = this.jsonParseToObjectGet( this.resourceStruct.contentStruct.result );
        
        this.attachmentNameList = this.skinsAttachmentNamesGet( this.json.skins );
        debugger;

        const spineAtlas = new TextureAtlas( this.json,
            function( name, callback ) {
                callback(Texture.from(name));
            }
        );

        const spineAtlasLoader = new AtlasAttachmentLoader( spineAtlas );
        const spineJsonParser = new SkeletonJson( spineAtlasLoader );
        const spineData = spineJsonParser.readSkeletonData( this.json );

        const spine = new Spine( spineData );
        debugger;
    }


    //
    // SKINS
    //

    skinsAttachmentNamesGet( skins ) {
        if ( !skins || !skins.length ) return;

        for ( let i = 0; i < skins.length; i++ ) {
            const skin = skins[ i ];
            // const attachment = this.skinsAttachmentParse( skin.attachments );

            for (const name in skin.attachments) {
                const attachment = skin.attachments[name];
                for (const attachTextureName in attachment) {
                    const attachTextureData = attachment[attachTextureName];
                    Texture.addToCache(ResourceSpineParser.texture, attachTextureName);
                }
            }
        }
    }

    skinAttachmentsParse( attachmentObject ) {
        const { name, attachments } = attachmentObject;
        return {
            ...AttachmentStruct,
            name,
            attachments: this
        }
    }

}

const AttachmentsStruct = {
    name: undefined,
    attachments: []
}

const AttachmentStruct = {
    name: undefined,
    attachments: []
}