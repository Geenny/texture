import MainApplication from "./app/MainApplication";
import * as PIXI from "pixi.js";

window.PIXI = PIXI;

require("pixi-spine");

const HTMLElement = document.getElementById( 'ApplicationContainer' );

function onStart() {

    const application = new MainApplication();
    application.HTMLElement = HTMLElement;
    application.init();

}

window.onload = function() {
    
    onStart();

};




