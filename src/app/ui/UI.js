import { Container, Graphics, Point, Text } from "pixi.js";
import ResourceType from "../../file/content/ResourceType";

export default class UI extends Container {

    init() {

        if ( this.inited ) return;
        this.inited = true;

        this.initVars();
        this.initContainers();

        this.update();
    }
    initVars() {
        this.size = new Point();
        this.resources = [];
        this.resourceButtonList = [];
    }
    initContainers() {
        if ( this.topPanel ) return;

        this.topPanel = new Container();
        this.addChild( this.topPanel );
    }

    resize( size ) {
        this.size = size;
        this.update();
    }

    update() {
        this.updateTopPanel();
    }
    updateTopPanel() {
        this.topPanel.position.x = ~~( this.size.x * 0.5 );
        this.clearButtons();
        this.addButtons();
    }

    addButton( resource, index = 0 ) {
        const button = new ButtonItem( resource );
        button.init();
        
        button.position.x = 70 * index;
        button.position.y = 40;

        button.interactive = true;
        button.buttonMode = true;

        this.topPanel.addChild( button );
        this.resourceButtonList.push( button );
    }
    addButtons() {
        for ( let i = 0; i < this.resources.length; i++ ) {
            const resource = this.resources[ i ];
            if ( !resource ) continue;
            this.addButton( resource, i );
        }

        this.addButton( null, this.resources.length );
    }
    clearButtons() {
        while( this.resourceButtonList.length ) {
            const button = this.resourceButtonList.shift();
            if ( !button ) continue;
            if ( button.parent ) {
                button.parent.removeChild( button );
            }
        }
    }

    resourceUpdate( resources ) {
        if ( Array.isArray( resources ) ) {
            this.resources = resources;
        }

        this.update();
    }

}

class ButtonItem extends Container {

    constructor( resource = null ) {
        super();
        this.resource = resource;
    }

    get type() { return "ADD"; }

    get color() {
        if ( this.resource ) {
            if ( this.resource.type === ResourceType.SPINE )
                return 0x336699;
            if ( this.resource.type === ResourceType.IMAGE )
                return 0x449922;
        }

        return 0xCCCCCC;
    }

    get letter() {
        if ( this.resource ) {
            if ( this.resource.type === ResourceType.SPINE )
                return "S";
            if ( this.resource.type === ResourceType.IMAGE )
                return "I";
        }

        return " ";
    }

    init() {
        this.draw();
    }

    draw() {
        this.drawBackground();
        this.drawBorder();
        this.drawContent();
    }
    drawBackground() {
        const background = new Graphics();
        background.beginFill( 0x000000, 1 );
        background.drawCircle( 0, 0, 30 );
        background.endFill();
        this.addChild( background );
    }
    drawBorder() {
        const border = new Graphics();
        border.lineStyle( 4, this.color, 1 );
        border.drawCircle( 0, 0, 30 );
        this.addChild( border );
    }
    drawContent() {
        if ( this.resource ) {
            const textField = new Text( this.letter, {
                fill: this.color,
                fontSize: 42,
                weight: 900
            } );
            textField.anchor.set( 0.5 );
            this.addChild( textField );

            return;
        }

        const line1 = new Graphics();
        const line2 = new Graphics();

        line1.lineStyle( 5, this.color, 1, 0.5 )
            .moveTo( 0, -15 )
            .lineTo( 0, 15 );
        line2.lineStyle( 5, this.color, 1, 0.5 )
            .moveTo( -15, 0 )
            .lineTo( 15, 0 );

        this.addChild( line1 );
        this.addChild( line2 );
    }

}

