import { Container, Text, Application, Graphics, Point } from "pixi.js";
import { Tween } from "@createjs/tweenjs";
import ContentManager from "../file/content/ContentManager";
import ResourceEvent from "../file/content/ResourceEvent";
import ResourceType from "../file/content/ResourceType";
import UI from "./ui/UI";

const CLICK = "click", DOWN = "mousedown", UP = "mouseup", OVER = "mouseover", OUT = "mouseout";

export default class MainApplication {

    //
    // GET/SET
    //

    get HTMLElement() { return this._HTMLElement; }
    set HTMLElement( value ) {
        this._HTMLElement = value;
    }



    //
    // INIT
    //

    init() {
        this._initVars();
        this._applicationInit();
        this._applicationContentManager();
        this._applicationLayersAdd();
        this._applicationResize();
    }

    _initVars() {
        this.size = new Point( 256, 256 );
        this.mousePointPrevious = new Point();
        this.selected = null;
        this.resources = [];
        this.slotNameList = [];
        this.skinButtonList = [];
        this.animationButtonList = [];
    }

    _applicationOptionsGet() {
        return { 
            width: this.size.x, 
            height: this.size.y,                       
            antialias: true, 
            transparent: false, 
            resolution: 1
        };
    }

    _applicationInit() {
        const applicationOptions = this._applicationOptionsGet();
        const application = new Application( applicationOptions );
        
        this.HTMLElement.appendChild( application.view );

        this.application = application;
        Application.application = application;

    }

    _applicationContentManager() {
        const contentManager = new ContentManager();
        contentManager.addEventListener( ResourceEvent.COMPLETE, ( event ) => {
            this.resourceAdd( event.resourceStruct );
        } );
        this.contentManager = contentManager;
    }

    _applicationLayersAdd() {
        this.resourceLayer = new Container();
        this.UI = new UI();

        this.UI.init();

        this.application.stage.addChild( this.resourceLayer );
        this.application.stage.addChild( this.UI );
    }



    //
    // RESIZE
    //

    _applicationResize() {
        this.sizeSet( window.innerWidth, window.innerHeight );
        this.onResize();
        window.addEventListener( "resize", event => {
            this.sizeSet( event.target.innerWidth, event.target.innerHeight );
            this.onResize();
        });
        window.addEventListener( "mousewheel", event => {
            this.scale( event.deltaY > 0 ? 1 : -1 );
        } );
        window.addEventListener( "mousemove", event => {
            if ( this.selected && this.draged && this.selected.instance === this.draged ) {
                const range = new Point( event.x - this.mousePointPrevious.x, event.y - this.mousePointPrevious.y );
                this.draged.position.x += range.x;
                this.draged.position.y += range.y;
            }
            this.mousePointPrevious = new Point( event.x, event.y );
        } );
    }

    sizeSet( width, height ) {
        this.size.x = width;
        this.size.y = height;
    }

    onResize() {
        this.application.renderer.resize( this.size.x, this.size.y );
        this.UI.resize( this.size );
    }




    //
    // SCALE
    //

    scale( scaleDirection ) {
        if ( !this.selected || !this.selected.instance ) return;
        const spine = this.selected.instance;
        let scaleTarget = scaleDirection > 0 ? spine.scale.x * 0.5 : spine.scale.x * 1.5;
        scaleTarget = scaleTarget < 0.1 ? 0.1 : scaleTarget;
        scaleTarget = scaleTarget > 10 ? 10 : scaleTarget;
        
        Tween.get( spine.scale )
            .to( { x: scaleTarget, y: scaleTarget }, 100 );

    }

    scaleSet( scale, animation = true ) {
        if ( !this.selected || !this.selected.instance ) return;

        if ( animation ) {
            this.selected.instance.scale.x = scale.x;
            this.selected.instance.scale.y = scale.y;
        } else {
            this.selected.instance.scale.x = scale.x;
            this.selected.instance.scale.y = scale.y;
        }
    }

    scaleAutoUpdate() {
        if ( !this.selected || !this.selected.instance ) return;

        switch( this.selected.type ) {
            case ResourceType.SPINE:
                this.scaleAutoSpine();
                break;
        }
    }

    scaleAutoSpine() {
        if ( !this.selected || !this.selected.instance ) return;
        const scale = this._scaleSizeGet( this.selected.instance );
        this.scaleSet( scale );
    }

    _scaleSizeGet( spine ) {
        const size = new Point( spine.spineData.width, spine.spineData.height );
        const scale = Math.min( this.size.x / size.x, this.size.y / size.y );
        return new Point( scale, scale );
    }



    //
    // POSITION
    //

    positionSet( position, animation = true ) {
        if ( !this.selected || !this.selected.instance ) return;
        this.selected.instance.position.x = position.x;
        this.selected.instance.position.y = position.y;
    }

    positionAutoUpdate() {
        if ( !this.selected || !this.selected.instance ) return;

        switch( this.selected.type ) {
            case ResourceType.SPINE:
                this.positionAutoSpine();
                break;
        }
    }

    positionAutoSpine() {
        if ( !this.selected || !this.selected.instance ) return;
        const position = this._positionSizeGet( this.selected.instance );
        this.positionSet( position );
    }

    _positionSizeGet( spine ) {
        return new Point( ~~( this.size.x * 0.5 ), ~~( this.size.y * 0.5 ) );
    }



    //
    // RESOURCE
    //

    resourceAdd( resourceStruct ) {

        const resource = this.resourceStructInit( resourceStruct );
        if ( !resource ) return;

        this.selectResource( resource );
        this.UI.resourceUpdate( this.resources );

        // const infoText = new Text( spine.width.toString() + " " + spine.height.toString(), { fontSize: 14, fill: 0xffffff } );
        // infoText.position.set( 5, this.size.height - 5 );
        // infoText.anchor.set( 0, 1 );
        // this.UILayer.addChild( infoText );
        
    }



    //
    // RESOURCE
    //

    resourceStructInit( resourceStruct ) {

        if ( !resourceStruct || !resourceStruct.instance ) return;
        if ( !resourceStruct.ready ) return;

        switch( resourceStruct.type ) {
            case ResourceType.SPINE:
                return this.resourceSpineInit( resourceStruct );

            case ResourceType.IMAGE:
            default:
                debugger;
        }

        return null;
    }

    resourceSpineInit( resourceStruct ) {
        const resource = {
            type: resourceStruct.type,
            instance: resourceStruct.instance,
            struct: resourceStruct,
            animation: null
        };

        this._resourceAddToList( resource );

        return resource;
    }

    _resourceAddToList( resource ) {
        this.resources.push( resource );
        this.UI.resourceUpdate( this.resources );
    }



    //
    // SELECTED
    //

    selectResource( resource ) {
        if ( !resource ) return;

        switch( resource.type ) {
            case ResourceType.SPINE:
                this.selectResourceSpine( resource );
                this.selected = resource;
                break;
        }

        this.positionAutoUpdate();
        this.scaleAutoUpdate();
    }
    selectResourceSpine( resource ) {
        this.addSpineInstanceByResource( resource );
        this.initSpineAnimations( resource );
        this.addAnimationButtons( resource );
        this.addSkinButtons( resource );
        // this.addSlotNames( resource );
    }



    //
    // INSTANCE SPINE
    //

    addSpineInstanceByResource( resource ) {

        // spine.position.set( ~~( this.size.width * 0.5 ), ~~( this.size.height * 0.5 ) );
        // spine.scale.set( 0.5, 0.5 );

        const spine = resource.instance;

        spine.interactive = true;
        spine.buttonMode = true;

        spine.on( DOWN, event => {
            if ( !this.spineIsSelected( event.currentTarget ) ) return;
            this.draged = event.currentTarget;
        } );
        spine.on( UP, event => {
            if ( !this.spineIsSelected( event.currentTarget ) ) return;
            this.draged = null;
        } );
        spine.on( OVER, event => {} );
        spine.on( OUT, event => {} );

        this.resourceLayer.addChild( spine );

        return spine;
    }



    //
    // SPINE INIT
    //

    initSpineAnimations( resource ) {
        this.animations = [];
        const spine = resource.instance;
        for ( let i = 0; i < spine.spineData.animations.length; i++ ) {
            this.animations.push( spine.spineData.animations[ i ].name );
        }
    }

    spineIsSelected( spine ) {
        return this.selected && this.selected.instance === spine;
    }



    //
    // ANIMATION BUTTONS
    //

    addAnimationButtons( resource ) {

        this.clearAnimationButtons();

        const spine = resource.instance;

        const methods = {
            click: ( event ) => {
                const animationName = event.currentTarget.animationName;
                spine.state.setAnimation( 0, animationName, true );
                resource.animation = animationName;
            },
            over: ( event ) => event.currentTarget.scale.set( 1.05, 1.05 ),
            out: ( event ) => event.currentTarget.scale.set( 1, 1 )
        };

        for ( let j = 0; j < this.animations.length; j++ ) {
            const button = new Container();
            const graphic = new Graphics();
            graphic.beginFill( 0x555555, 1 );
            graphic.drawRect( -60, -10, 120, 20 );
            graphic.endFill();

            const text = new  Text( this.animations[ j ], { fontSize: 12 } );
            text.anchor.set( 0.5, 0.5 );

            button.addChild( graphic );
            button.addChild( text );

            button.animationName = this.animations[ j ];
            button.interactive = true;
            button.buttonMode = true;
            button.position.set( 65, 15 + 22 * j );

            button.on( CLICK, methods.click );
            button.on( OVER, methods.over );
            button.on( OUT, methods.out );

            this.UI.addChild( button );

            this.animationButtonList.push( button );
        }
    }

    clearAnimationButtons() {
        while( this.animationButtonList.length ) {
            const buttonVO = this.animationButtonList.shift();
            const { button, methods } = buttonVO;
            if ( !methods || !button || !button.parent ) continue;
            button.parent.removeChild( button );

            button.off( CLICK, methods.click );
            button.off( OVER, methods.over );
            button.off( OUT, methods.out );
        }
    }



    //
    // SKIN BUTTONS
    //

    addSkinButtons( resource ) {

        this.clearSkinButtons();

        const spine = resource.instance;

        const methods = {
            click: ( event ) => {
                spine.skeleton.setSkinByName( event.currentTarget.skinName );
                spine.skeleton.setSlotsToSetupPose();

                // infoText.text = spine.width.toString() + " " + spine.height.toString();
            },
            over: ( event ) => event.currentTarget.scale.set( 1.05, 1.05 ),
            out: ( event ) => event.currentTarget.scale.set( 1, 1 )
        };

        for ( let j = 0; j < spine.spineData.skins.length; j++ ) {
            const skin = spine.spineData.skins[ j ];

            const button = new Container();
            const graphic = new Graphics();
            graphic.beginFill( 0x116633, 1 );
            graphic.drawRect( -60, -10, 120, 20 );
            graphic.endFill();

            const text = new  Text( skin.name, { fontSize: 12 } );
            text.anchor.set( 0.5, 0.5 );

            button.addChild( graphic );
            button.addChild( text );

            button.skinName = skin.name;
            button.interactive = true;
            button.buttonMode = true;
            button.position.set( 190, 15 + 22 * j );

            button.on( CLICK, methods.click );
            button.on( OVER, methods.over );
            button.on( OUT, methods.out );

            this.UI.addChild( button );

            this.skinButtonList.push( { button, methods } );
        }
    }

    clearSkinButtons() {
        while( this.skinButtonList.length ) {
            const buttonVO = this.skinButtonList.shift();
            const { button, methods } = buttonVO;

            if ( !methods || !button || !button.parent ) continue;

            button.parent.removeChild( button );

            button.off( CLICK, methods.click );
            button.off( OVER, methods.over );
            button.off( OUT, methods.out );
        }
    }



    //
    // SLOT
    //

    addSlotNames( resource ) {

        this.clearSlotNames();

        const spine = resource.instance;

        for ( let i = 0; i < spine.skeleton.slots.length; i++ ) {
            const slot = spine.skeleton.slots[ i ];
            if ( slot.currentSprite ) {
                // const graphic = new Graphics();
                // graphic.beginFill( Math.floor( 0xffffff * Math.random() ), 0.5 );
                // graphic.drawRect( -10, -10, 20, 20 );
                // graphic.endFill();
                // slot.currentSprite.addChild( graphic );

                if ( slot.currentSprite.children.length === 0 ) {
                    const text = new Text( slot.data.name, { fontSize: 20, fill: 0xffffff } );
                    text.anchor.set( 0, 0.5 );
                    slot.currentSprite.addChild( text );
                    this.slotNameList.push( text );
                }
            }
        }
    }

    clearSlotNames() {
        while( this.slotNameList.length ) {
            const instance = this.slotNameList.shift();
            if ( !instance || !instance.parent ) continue;
            instance.parent.removeChild( instance );
        }
    }
    
}