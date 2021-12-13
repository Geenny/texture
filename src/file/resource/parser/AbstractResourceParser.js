import EventDispathcer from "../../../event/EventDispatcher";
import ResourceParserEvent from "../ResourceParserEvent";
import ResourceStruct from "../ResourceStruct";
import ResourceType from "../ResourceType";

export default class AbstractResourceParser extends EventDispathcer {

    constructor() {
        super();
    }

    get isRequire() { return this.resourceRequireSourceNameList.length > 0; }

    get resourceRequireSourceNameList() { return []; }

    get resourceRequireNameList() { return []; }

    guard( contentStruct ) { return false; }

    parse( contentStruct ) {
        this.resourceStruct = {
            ... ResourceStruct,
            ready: true,
            name: contentStruct.name,
            type: ResourceType.ANY,
            instance: contentStruct.result,
            contentStruct,
            resourceStructList: []
        };

        this.resourceReady( resourceStruct );
    }

    resourceReady( resourceStruct ) {
        const event = new ResourceParserEvent( ResourceParserEvent.COMPLETE, this, resourceStruct );
        this.dispatchEvent( event );
    }

    resourceRequireSet( resourceStruct ) {
        this.resourceRequireList.push( resourceStruct );
    }

}