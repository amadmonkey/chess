import React from 'react';

const PieceNames = {
    PAWN: "PAWN",
    ROOK: "ROOK",
    KNIGHT: "KNIGHT",
    BISHOP: "BISHOP",
    QUEEN: "QUEEN",
    KING: "KING"
}

class Piece {
    constructor({ isLight = "", pieceName = "", position = "", isOpponent = false }){
        this.id = 'p-' + position;
        this.isLight = isLight;
        this.pieceName = pieceName;
        this.position = position;
        this.isOpponent = isOpponent;
        this.component = React.createElement('div', {id: `p-${this.position}`, className: `chess-piece ${isOpponent ? "opponent" : ""}`}, `${this.pieceName}`)
    }
}

// const getPawns = (attr) => {
//     let pieces = [];
//     for(let x = 0; x < 8; x++){
//         let charCode = isLight ? (65 + x) : (72 - x);
//         pieces.push(new Piece({isLight: isLight, name: PieceNames.PAWN, position: `${String.fromCharCode(charCode)}${isLight ? 2 : 7}`}));
//     }
//     return pieces;
// }

// const getRooks = (attr) => {
//     return [
//         new Piece({isLight: isLight, name: PieceNames.ROOK, position: isLight ? 'A1' : 'H8'}),
//         new Piece({isLight: isLight, name: PieceNames.ROOK, position: isLight ? 'H1' : 'A8'}),
//     ]
// }

// const getKnights = (attr) => {
//     return [
//         new Piece({isLight: isLight, name: PieceNames.KNIGHT, position: isLight ? 'B1' : 'G8'}),
//         new Piece({isLight: isLight, name: PieceNames.KNIGHT, position: isLight ? 'G1' : 'B8'}),
//     ]
// }

// const getBishops = (attr) => {
//     return [
//         new Piece({isLight: isLight, name: PieceNames.BISHOP, position: isLight ? 'C1' : 'F8'}),
//         new Piece({isLight: isLight, name: PieceNames.BISHOP, position: isLight ? 'F1' : 'C8'}),
//     ]
// }

// const getQueen = (attr) => {
//     return [
//         new Piece({isLight: isLight, name: PieceNames.QUEEN, position: isLight ? 'D1' : 'D8'}),
//     ]
// }

// const getKing = (attr) => {
//     return [
//         new Piece({isLight: isLight, name: PieceNames.KING, position: isLight ? 'E1' : 'E8'}),
//     ]
// }

const getPiece = (pieceName, attr) => {
    let attr1;
    let attr2;
    attr.pieceName = pieceName;
    switch (pieceName) {
        default:
        case PieceNames.PAWN:
            let pieces = [];
            for(let x = 0; x < 8; x++){
                let charCode = attr.isLight ? (65 + x) : (72 - x);
                attr.position = `${String.fromCharCode(charCode)}${attr.isLight ? 2 : 7}`;
                pieces.push(new Piece(attr));
            }
            return pieces;
        case PieceNames.ROOK:
            attr1 = {...attr};
            attr2 = {...attr};
            attr1.position = attr.isLight ? 'A1' : 'H8';
            attr2.position = attr.isLight ? 'H1' : 'A8';
            return [
                new Piece(attr1),
                new Piece(attr2)
            ]
        case PieceNames.KNIGHT:
            attr1 = {...attr};
            attr2 = {...attr};
            attr1.position = attr.isLight ? 'B1' : 'G8';
            attr2.position = attr.isLight ? 'G1' : 'B8';
            return [
                new Piece(attr1),
                new Piece(attr2)
            ]
        case PieceNames.BISHOP:
            attr1 = {...attr};
            attr2 = {...attr};
            attr1.position = attr.isLight ? 'C1' : 'F8';
            attr2.position = attr.isLight ? 'F1' : 'C8';
            return [
                new Piece(attr1),
                new Piece(attr2)
            ]
        case PieceNames.QUEEN:
            attr.position = attr.isLight ? 'D1' : 'D8';
            return [
                new Piece(attr)
            ]
        case PieceNames.KING:
            attr.position = attr.isLight ? 'E1' : 'E8';
            return [
                new Piece(attr)
            ]
    }
        
}

const getSet = (attr) => {
    return [
        ...getPiece(PieceNames.PAWN, attr),
        ...getPiece(PieceNames.ROOK, attr),
        ...getPiece(PieceNames.KNIGHT, attr),
        ...getPiece(PieceNames.BISHOP, attr),
        ...getPiece(PieceNames.QUEEN, attr),
        ...getPiece(PieceNames.KING, attr)
    ];
}

const SET = getSet

export default SET