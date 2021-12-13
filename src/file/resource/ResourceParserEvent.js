import Event from "../../event/Event.js";

export default class ResourceParserEvent extends Event {
    constructor( type, parser, resourceStruct ) {
        super( type );
        this.parser = parser;
        this.resourceStruct = resourceStruct;
        // this.resourceParserStruct = resourceParserStruct;
    }
}

ResourceParserEvent.COMPLETE = "ResourceParserComplete";
ResourceParserEvent.CANCEL = "ResourceParserCancel";