export default class FileType {

    constructor() {}

    static get JSON() { return FileType.types.JSON; }
    static get TXT() { return FileType.types.TXT; }
    static get ATLAS() { return FileType.types.ATLAS; }
    static get PNG() { return FileType.types.PNG; }
    static get JPG() { return FileType.types.JPG; }

    static get types() {
        return {
            JSON: "json",
            TXT: "txt",
            ATLAS: "atlas",
            PNG: "png",
            JPG: "jpg"
        };
    }

    static isFileType( type ) {
        return FileType.types[ type ];
    }

    static typeFromFileNameGet( fileName ) {
        if ( fileName && fileName.length > 0 ) {
            const pointPosition = fileName.lastIndexOf( "." ) + 1;
            const lastPosition = fileName.length;
            return pointPosition < lastPosition ? fileName.substring( pointPosition, lastPosition ) : "";
        }
        return "";
    }

    static nameFromFileNameGet( fileName ) {
        if ( fileName && fileName.length > 0 ) {
            const pointPosition = fileName.lastIndexOf( "." );
            return pointPosition > 0 ? fileName.substring( 0, pointPosition ) : "";
        }
        return "";
    }

}



