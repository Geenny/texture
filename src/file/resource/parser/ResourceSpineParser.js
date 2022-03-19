import { AtlasAttachmentLoader, SkeletonJson, Spine } from "@pixi-spine/runtime-3.8";
import { TextureAtlas } from "pixi-spine";
import { Graphics, Texture } from "pixi.js";
import MainApplication from "../../../app/MainApplication";
import FileType from "../../FileType";
import ResourceStruct from "../ResourceStruct";
import ResourceType from "../ResourceType";
import AbstractResourceParser from "./AbstractResourceParser";

/**
 * https://github.com/pixijs/spine/blob/master/examples/dynamic_texture_atlas.md
 */
export default class ResourceSpineParser extends AbstractResourceParser {

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
        this.spineJSONParse();
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
        
        const attachmentList = this.skinsAttachmentNamesGet( this.json.skins );
        const attachmentData = this.TESTcreateAtlasData( attachmentList );

        const spineAtlas = new TextureAtlas();
        spineAtlas.addTextureHash( attachmentData, false );

        const spineAtlasLoader = new AtlasAttachmentLoader( spineAtlas );
        const spineJsonParser = new SkeletonJson( spineAtlasLoader );
        const spineData = spineJsonParser.readSkeletonData( this.json );

        const spine = new Spine( spineData );
        spine.position.set( 600, 400 );
        spine.scale.set( 0.5 );
        spine.state.setAnimation( 0, "animation", true );

        MainApplication.application.stage.addChild( spine );
    }


    //
    // SKINS
    //

    skinsAttachmentNamesGet( skins ) {
        if ( !skins || !skins.length ) return;

        const list = [];

        for ( let i = 0; i < skins.length; i++ ) {
            const skin = skins[ i ];
            // const attachment = this.skinsAttachmentParse( skin.attachments );

            for ( const attachmentsName in skin.attachments ) {
                const attachmentsData = skin.attachments[ attachmentsName ];
                for ( const attachmentName in attachmentsData ) {
                    const attachmentData = attachmentsData[ attachmentName ];

                    const texture = this.TESTcreateTexture( attachmentData );
                    Texture.addToCache( texture, attachmentName );
                    
                    list.push( { name: attachmentName, attachment: attachmentData, texture } );
                }
            }
        }

        return list;
    }



    // skinAttachmentsParse( attachmentObject ) {
    //     const { name, attachments } = attachmentObject;
    //     return {
    //         ...AttachmentStruct,
    //         name,
    //         attachments: this
    //     }
    // }


    //
    // TRASH
    //

    TESTcreateAtlasData( attachmentList ) {
        const object = {};
        attachmentList.map( attachment => { 
            object[ attachment.name ] = attachment.texture;
        } );
        return object;
    }

    TESTcreateTexture( attachmentData ) {
        const graphics = new Graphics();
        graphics.beginFill( 0xff0000, 0.2 );
        graphics.drawRect( 0, 0, attachmentData.width, attachmentData.height );
        return MainApplication.application.renderer.generateTexture( graphics, {} );
    }

}

const AttachmentStruct = {
    name: undefined,
    attachment: undefined,
    texture: undefined
}