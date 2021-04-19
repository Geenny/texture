export default class Event {
    
    constructor(type) {
        this.type = type;
        this.target = null;
    }

}

Event.ANY = "any";
Event.ACITVE = "active";
Event.DEACTIVE = "deactive";