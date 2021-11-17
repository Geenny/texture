import MainApplication from "./app/MainApplication";

const HTMLElement = document.getElementById( 'ApplicationContainer' );

function onStart() {

    const application = new MainApplication();
    application.HTMLElement = HTMLElement;
    application.init();

}

window.onload = function() {
    
    onStart();

};




