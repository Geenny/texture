import FileType from "../../FileType";
import ResourceStruct from "../ResourceStruct";
import ResourceType from "../ResourceType";
import AbstractResourceParser from "./AbstractResourceParser";

/**
 * https://github.com/pixijs/spine/blob/master/examples/dynamic_texture_atlas.md
 */
export default class ResourceSpineParser extends AbstractResourceParser {

    guard( contentStruct ) {
        return contentStruct.type === FileType.JSON && this.checkJSONContentStruct( contentStruct )
    }
    
    parse( contentStruct ) {
        this.resourceCreate( contentStruct );
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
        const jsonData = JSON.parse( contentStruct.result );

        if ( !jsonData ) return false;
        if ( !jsonData.skeleton || !jsonData.skeleton.spine ) return false;
        if ( !jsonData.bones || !jsonData.bones.length ) return false;
        if ( !jsonData.slots || !jsonData.slots.length ) return false;
        return true;
    };

}