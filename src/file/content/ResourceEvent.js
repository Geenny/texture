import Event from "../../event/Event.js";

export default class ResourceEvent extends Event {
    constructor( type, resourceStruct ) {
        super( type );
        this.resourceStruct = resourceStruct;
    }
}

ResourceEvent.COMPLETE = "ResourceDragComplete";