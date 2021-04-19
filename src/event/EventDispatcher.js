import Event from "./Event.js";

export default class EventDispathcer {

    constructor() {
        this._dispatcher = [];
    }

    /**
     * Распространение события
     * @param {Event} event Экземпляр @Event 
     * @return {EventDispathcer} Текущий экземпляр @EventDispathcer
     */
    dispatchEvent( event ) {
        this._dispatching = true;
        if ( !event.target ) event.target = this;
        // console.log( event );
        this._dispatcher.forEach( target => {
            if ( this._stop ) return;
            if ( target ) {
                if ( target.type === event.type || target.type === Event.ANY ) {
                    target.handler = target.handler.bind( target.context );
                    target.handler( event );
                }
            }
        });
        this._dispatching = this._stop = false;
        return this;
    }

    /**
     * Возвращает значение наличия события по входящим параметрам
     * @param {String} type Имя события
     * @param {Function} handler Метод для проверки привязки события непосредственно
     *    к этому метода
     * @return {Boolean}
     */
    hasEventListener( type, handler = null ) {
        this._dispatcher.forEach( target => {
            if ( target.type === type ) {
                return handler === null ||
                    handler === target.handler;
            }
        });
        return false;
    }

    /**
     * Добавление события по имени события и методу возврата
     * @param {String} type Имя события
     * @param {Fucntion} handler Метод возврата события
     * @param {Boolean} useCapture 
     * @param {Number} priority 
     */
    addEventListener( type, handler, context = null, useCapture = false, priority = 0 ) {
        if ( !type || !handler ) return;
        const event = new EventVO( {
            type,
            handler,
            context,
            useCapture,
            priority
        } )
        this._dispatcher.push( event );
        this._dispatcher.sort((a, b) => {
            if ( a.priority > b.priority) return 1;
            if ( a.priority < b.priority) return -1;
            return 0;
        });
        return this;
    }

    /**
     * Добавление события из списка событий
     * @param {Array<String>} types Список имен событий
     * @param {Fucntion} handler Метод возврата события
     * @param {Boolean} useCapture 
     * @param {Number} priority 
     */
    addEventListeners( types = [], handler, useCapture = false, priority = 0 ) {
        if ( !types || !handler ) return;
        types.forEach( type => {
            this.addEventListener( type, handler, useCapture, priority )
        });
        return this;
    }

    /**
     * Удаление события
     * @param {String} type Имя события
     * @param {Fucntion} handler Метод возврата события
     */
    removeEventListener( type, handler = null ) {
        if ( !type ) return;
        let index = this._dispatcher.length;
        while ( --index > 0 ) {
            const event = this._dispatcher[ index ]
            if ( event.type !== type ) continue;
            if ( handler === null || handler === event.handler ) {
                this._dispatcher.splice( index, 1 )
            }
        }
        return this;
    }

    /**
     * Удаляет все события данного вещателя событий
     */
    removeAllListeners() {
        this._dispatcher.splice( 0, this._dispatcher.length );
        return this;
    }

    /**
     * Stopping dispatching if it is in progress
     */
    stopPropagation() {
        this._stop = this._dispatching;
    }
    
}

class EventVO {

    constructor( data ) {
        this.parse( data )
    }

    parse( data ) {
        if ( !data ) return;
        this.type = data.type
        this.handler = data.handler
        this.context = data.context
        this.useCapture = data.useCapture || false
        this.priority = data.priority || 0
    }

}