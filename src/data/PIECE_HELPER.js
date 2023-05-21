import React from 'react';
import { ReactComponent as PAWN_LIGHT } from '../img/cute_light/pawn.svg';
import { ReactComponent as PAWN_DARK } from '../img/cute_dark/pawn.svg';
import { ReactComponent as ROOK_LIGHT } from '../img/cute_light/rook.svg';
import { ReactComponent as ROOK_DARK } from '../img/cute_dark/rook.svg';
import { ReactComponent as KNIGHT_LIGHT } from '../img/cute_light/knight.svg';
import { ReactComponent as KNIGHT_DARK } from '../img/cute_dark/knight.svg';
import { ReactComponent as BISHOP_LIGHT } from '../img/cute_light/bishop.svg';
import { ReactComponent as BISHOP_DARK } from '../img/cute_dark/bishop.svg';
import { ReactComponent as QUEEN_LIGHT } from '../img/cute_light/queen.svg';
import { ReactComponent as QUEEN_DARK } from '../img/cute_dark/queen.svg';
import { ReactComponent as KING_LIGHT } from '../img/cute_light/king.svg';
import { ReactComponent as KING_DARK } from '../img/cute_dark/king.svg';

const PIECE_NAMES = {
    PAWN: "PAWN",
    ROOK: "ROOK",
    KNIGHT: "KNIGHT",
    BISHOP: "BISHOP",
    QUEEN: "QUEEN",
    KING: "KING"
}

// const CONDITION = {
//     initial: 'INITIAL', // has to be the first move they make
//     no_piece: 'NO_PIECE', // no piece regardless of side
//     has_opponent: 'HAS_OPPONENT', // has opposing piece
//     no_ally: 'NO_ALLY', // has to have no ally piece
//     until_opponent: 'UNTIL_OPPONENT', // loop condition. stop if found an opponent 
//     castling: 'CASTLING' // loop condition. stop if found an opponent 
// }

const getPieceImage = (params) => {
    switch (params.pieceName) {
        case PIECE_NAMES.PAWN:
            return params.isLight ? <PAWN_LIGHT/> : <PAWN_DARK />;
        case PIECE_NAMES.ROOK:
            return params.isLight ? <ROOK_LIGHT /> : <ROOK_DARK />;
        case PIECE_NAMES.KNIGHT:
            return params.isLight ? <KNIGHT_LIGHT/> : <KNIGHT_DARK />;
        case PIECE_NAMES.BISHOP:
            return params.isLight ? <BISHOP_LIGHT/> : <BISHOP_DARK />;
        case PIECE_NAMES.QUEEN:
            return params.isLight ? <QUEEN_LIGHT/> : <QUEEN_DARK />;
        case PIECE_NAMES.KING:
            return params.isLight ? <KING_LIGHT /> : <KING_DARK />;
        default:
            return params.isLight ? <PAWN_LIGHT /> : <PAWN_DARK />;
    }
}

const PIECE = {
    GET: {
        image: getPieceImage,
    }
}

export default PIECE;