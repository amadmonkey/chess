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

const PieceNames = {
    PAWN: "PAWN",
    ROOK: "ROOK",
    KNIGHT: "KNIGHT",
    BISHOP: "BISHOP",
    QUEEN: "QUEEN",
    KING: "KING"
}

const getPieceImage = (params) => {
    switch (params.pieceName) {
        case PieceNames.PAWN:
            return params.isLight ? <PAWN_LIGHT /> : <PAWN_DARK />;
        case PieceNames.ROOK:
            return params.isLight ? <ROOK_LIGHT /> : <ROOK_DARK />;
        case PieceNames.KNIGHT:
            return params.isLight ? <KNIGHT_LIGHT /> : <KNIGHT_DARK />;
        case PieceNames.BISHOP:
            return params.isLight ? <BISHOP_LIGHT /> : <BISHOP_DARK />;
        case PieceNames.QUEEN:
            return params.isLight ? <QUEEN_LIGHT /> : <QUEEN_DARK />;
        case PieceNames.KING:
            return params.isLight ? <KING_LIGHT /> : <KING_DARK />;
    }
}

export default {
    GET: getPieceImage
}