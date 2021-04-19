import { Container } from "pixi.js";

export default class TopPanel extends Container {

    init() {

        if ( this.inited ) return;
        this.inited = true;

    }

}