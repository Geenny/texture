import { Point } from "pixi.js";

export const BUTTON_CONFIG = {
    width: 200,
    height: 200,
    src: "./assets/images/UI/ButtonSpin.png"
};


export const LINE_TYPE_DEFAULT = "default";
export const SLOT_CONFIG_DEFAULT = {
    config: {
        lineType: LINE_TYPE_DEFAULT,
        reels: {
            time: 3000,
            speed: 200,
            sizes: [ 3, 3, 3 ]
        },
        symbol: {
            size: new Point( 200, 200 ),
            border: new Point( 2, 2 )
        }
    },
    symbols: [
        { id: 1, name: "J", src: "./assets/images/symbols/J.png" },
        { id: 2, name: "Q", src: "./assets/images/symbols/Q.png" },
        { id: 3, name: "K", src: "./assets/images/symbols/K.png" },
        { id: 4, name: "A", src: "./assets/images/symbols/A.png" },
        { id: 5, name: "7", src: "./assets/images/symbols/7.png" }
    ],
    lines: [
        {
            type: LINE_TYPE_DEFAULT,
            line: [ 1, 1, 2, 2, 1, 1, 3, 2, 2, 4, 2, 3, 1, 1, 1, 1, 2, 2, 3, 2, 4, 1, 1, 2, 2, 5, 2, 2, 3, 2, 1, 1 ]
        }
    ],
    winLines: {

        // Линии для списка рилов
        lines: [
            { line: [ 0 ] },
            { line: [ 1 ] },
            { line: [ 2 ] }
        ],

        // Награды за линию с заполненностью в @symbolsAmount для списка символов @symbols
        reward: [
            { symbolsAmount: 1, multiply: 2, isDefault: true },
            { symbolsAmount: 1, multiply: 4, symbols: [ 4 ] },
            { symbolsAmount: 1, multiply: 10, symbols: [ 5 ] },
        ]
    }
};