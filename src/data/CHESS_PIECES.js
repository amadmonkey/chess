import React from 'react';
import { ReactComponent as PAWN_LIGHT } from '../img/chess_pieces/pawn-light.svg';
import { ReactComponent as PAWN_DARK } from '../img/chess_pieces/pawn-dark.svg';
import { ReactComponent as ROOK_LIGHT } from '../img/chess_pieces/rook-light.svg';
import { ReactComponent as ROOK_DARK } from '../img/chess_pieces/rook-dark.svg';
import { ReactComponent as KNIGHT_LIGHT } from '../img/chess_pieces/knight-light.svg';
import { ReactComponent as KNIGHT_DARK } from '../img/chess_pieces/knight-dark.svg';
import { ReactComponent as BISHOP_LIGHT } from '../img/chess_pieces/bishop-light.svg';
import { ReactComponent as BISHOP_DARK } from '../img/chess_pieces/bishop-dark.svg';
import { ReactComponent as QUEEN_LIGHT } from '../img/chess_pieces/queen-light.svg';
import { ReactComponent as QUEEN_DARK } from '../img/chess_pieces/queen-dark.svg';
import { ReactComponent as KING_LIGHT } from '../img/chess_pieces/king-light.svg';
import { ReactComponent as KING_DARK } from '../img/chess_pieces/king-dark.svg';

const PieceNames = {
    PAWN: "PAWN",
    ROOK: "ROOK",
    KNIGHT: "KNIGHT",
    BISHOP: "BISHOP",
    QUEEN: "QUEEN",
    KING: "KING"
}

class Piece {
    constructor({ isLight = "", pieceName = "", position = "", isOpponent = false, component = "" }){
        this.id = 'p-' + position;
        this.isLight = isLight;
        this.pieceName = pieceName;
        this.position = position;
        this.isOpponent = isOpponent;
        this.component = component;
    }
}

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
                attr.component = attr.isLight ? <PAWN_LIGHT /> : <PAWN_DARK />;
                pieces.push(new Piece(attr));
            }
            return pieces;
        case PieceNames.ROOK:
            attr1 = {...attr};
            attr2 = {...attr};
            attr1.position = attr.isLight ? 'A1' : 'H8';
            attr2.position = attr.isLight ? 'H1' : 'A8';
            attr1.component = attr1.isLight ? <ROOK_LIGHT /> : <ROOK_DARK />;
            attr2.component = attr2.isLight ? <ROOK_LIGHT /> : <ROOK_DARK />;
            return [
                new Piece(attr1),
                new Piece(attr2)
            ]
        case PieceNames.KNIGHT:
            attr1 = {...attr};
            attr2 = {...attr};
            attr1.position = attr.isLight ? 'B1' : 'G8';
            attr2.position = attr.isLight ? 'G1' : 'B8';
            attr1.component = attr1.isLight ? <KNIGHT_LIGHT /> : <KNIGHT_DARK />;
            attr2.component = attr2.isLight ? <KNIGHT_LIGHT /> : <KNIGHT_DARK />;
            return [
                new Piece(attr1),
                new Piece(attr2)
            ]
        case PieceNames.BISHOP:
            attr1 = {...attr};
            attr2 = {...attr};
            attr1.position = attr.isLight ? 'C1' : 'F8';
            attr2.position = attr.isLight ? 'F1' : 'C8';
            attr1.component = attr1.isLight ? <BISHOP_LIGHT /> : <BISHOP_DARK />;
            attr2.component = attr2.isLight ? <BISHOP_LIGHT /> : <BISHOP_DARK />;
            return [
                new Piece(attr1),
                new Piece(attr2)
            ]
        case PieceNames.QUEEN:
            attr.position = attr.isLight ? 'D1' : 'D8';
            attr.component = attr.isLight ? <QUEEN_LIGHT /> : <QUEEN_DARK />;
            return [
                new Piece(attr)
            ]
        case PieceNames.KING:
            attr.position = attr.isLight ? 'E1' : 'E8';
            attr.component = attr.isLight ? <KING_LIGHT /> : <KING_DARK />;
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