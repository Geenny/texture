import EventDispathcer from "../../event/EventDispatcher.js";
import ResourceEvent from "./ResourceEvent.js";
import ResourceParserEvent from "./ResourceParserEvent.js";
import ResourceType from "./ResourceType.js";
import ResourceTypeAssocs from "./ResourceTypeAssocs.js";

export default class ResourceParserManager extends EventDispathcer {

    constructor() {
        super();
        this.init();
    }

    init() {
        this.resourceParserStructList = [];
    }
    
    contentToResourceParse( contentStruct, contentStructList ) {
        this.parse( { contentStruct, contentStructList } );
    }

    parse( resourceParserStruct ) {
        const contentStruct = resourceParserStruct.contentStruct;
        const classList = this.parserClassListGet( contentStruct );

        for ( let i = 0; i < classList.length; i++ ) {
            const ParserClass = classList[ i ];
            const parser = new ParserClass();
            if ( !parser.guard( contentStruct ) ) continue;

            resourceParserStruct.parser = parser;
            this.parserExecuteHandle( resourceParserStruct );
        }
    }

    parserClassListGet( contentStruct ) {
        for (const contentType in ResourceTypeAssocs ) {
            const classList = ResourceTypeAssocs[ contentType ];
            if ( contentType !== contentStruct.type ) continue;
            return classList;
        }

        return [];
    }


    //
    // RESOURCE
    //

    resourceStructByNameGet( name ) {
        for ( let i = 0; i < this.resourceParserStructList.length; i++ ) {
            const resourceParserStruct = this.resourceParserStructList[ i ];
            const parser = resourceParserStruct.parser;
            if ( parser.resourceStruct && parser.resourceStruct.name === name ) {
                return parser.resourceStruct;
            }
        }
        return undefined;
    }

    resourceStructByFileNameGet( name ) {
        for ( let i = 0; i < this.resourceParserStructList.length; i++ ) {
            const resourceParserStruct = this.resourceParserStructList[ i ];
            const contentStruct = resourceParserStruct.contentStruct;
            const parser = resourceParserStruct.parser;
            if ( contentStruct && contentStruct.file.name === name ) {
                return parser.resourceStruct;
            }
        }
        return undefined;
    }


    //
    // RESOURCE PARSER
    //

    resourseParserExist( resourceParserStruct ) {
        return this.resourceParserStructList.indexOf( resourceParserStruct ) >= 0;
    }

    resourceParserStructAdd( resourceParserStruct ) {
        if ( this.resourseParserExist( resourceParserStruct ) ) return;
        this.resourceParserStructList.push( resourceParserStruct )
    }

    resourceParserStructRemove( resourceParserStruct ) {
        const index = this.resourceParserStructList.indexOf( resourceParserStruct );
        if ( index >= 0 ) this.resourceParserStructList.splice( index, 1 );
    }

    resourceParserGetByParser( parser ) {
        for ( let i = 0; i < this.resourceParserStructList.length; i++ ) {
            const resourceParserStruct = this.resourceParserStructList[ i ];
            if ( resourceParserStruct.parser === parser ) {
                return resourceParserStruct;
            }
        }
        return undefined;
    }

    resourceParserGetByContentStruct( contentStruct ) {
        for ( let i = 0; i < this.resourceParserStructList.length; i++ ) {
            const resourceParserStruct = this.resourceParserStructList[ i ];
            const parser = resourceParserStruct.parser;
            if ( parser.contentStruct === contentStruct ) {
                return resourceParserStruct;
            }
        }
        return undefined;
    }



    //
    // RESOURCE PARSER HANDLE
    //

    parserExecuteHandle( resourceParserStruct ) {
        const parser = resourceParserStruct.parser;
        if ( !parser ) return;

        this.resourceParserStructAdd( resourceParserStruct );

        this.onParseComplete = this.onParseComplete.bind( this );
        this.onParseCancel = this.onParseCancel.bind( this );

        parser.addEventListener( ResourceParserEvent.COMPLETE, this.onParseComplete );
        parser.addEventListener( ResourceParserEvent.CANCEL, this.onParseCancel );
        parser.parse( resourceParserStruct.contentStruct );
    }

    onParseComplete( event ) {
        const resourceParserStruct = this.resourceParserGetByParser( event.target );
        const parser = resourceParserStruct.parser;

        if ( !parser.resourceStruct ) return;

        const resourceEvent = new ResourceEvent( ResourceEvent.COMPLETE, parser.resourceStruct );
        this.dispatchEvent( resourceEvent );

        this.requireUpdate();

        console.log("ResourceParser: ", parser.resourceStruct.name, " COMPLETE!!!");
    }

    onParseCancel( event ) {
        const resourceParserStruct = this.resourceParserGetByParser( event.target );
        if ( !resourceParserStruct ) {
            debugger;
            return;
        }
        this.resourceParserStructRemove( resourceParserStruct );
    }



    //
    // REQUIRE
    //

    requireUpdate() {
        for ( let i = 0; i < this.resourceParserStructList.length; i++ ) {
            const resourceParserStruct = this.resourceParserStructList[ i ];
            const parser = resourceParserStruct.parser;
            this.requireUpdateParser( parser );
        }
        return undefined;
    }

    requireUpdateParser( parser ) {
        if ( !parser || parser.resourceStruct.ready || !parser.isRequire ) return;

        for ( let i = parser.resourceRequireNameList.length - 1; i > -1; i-- ) {
            const name = parser.resourceRequireNameList[ i ];
            const resourceStruct = this.resourceStructByFileNameGet( name );
            if ( !resourceStruct || !resourceStruct.ready ) continue;
            parser.resourceRequireSet( resourceStruct );
        }
    }

}