import Event from "../../event/Event.js";

export default class ContentDropEvent extends Event {
    constructor( type, contentStruct ) {
        super( type );
        this.contentStruct = contentStruct;
    }
}

ContentDropEvent.DRAGENTER = "contentDropDragEnter";
ContentDropEvent.DRAGOVER = "contentDropDragOver";
ContentDropEvent.DRAGLEAVE = "contentDropDragLeave";
ContentDropEvent.DRAGNDROP = "contentDropDragNDrop";
ContentDropEvent.ONLOAD = "contentDropOnLoad";