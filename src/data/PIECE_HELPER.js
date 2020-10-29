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

const CONDITION = {
    initial: 'INITIAL', // has to be the first move they make
    no_piece: 'NO_PIECE', // no piece regardless of side
    has_opponent: 'HAS_OPPONENT', // has opposing piece
    no_ally: 'NO_ALLY', // has to have no ally piece
    until_opponent: 'UNTIL_OPPONENT', // loop condition. stop if found an opponent 
    castling: 'CASTLING' // loop condition. stop if found an opponent 
}

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

const getDomById = (id) => document.getElementById(id);


const testConditions = (piece, tile, conditions) => { // class tile with each rule. tile is valid until proven otherwise

    if(tile){ // if tile exists
        let isTileValid = true, stop = false, castling = false;

        // since no one piece can capture an allied piece, check for this first before looping through conditions
        if(tile.childNodes.length) {
            if(!tile.childNodes[0].classList.contains('opponent')) {
                return { tile: null, stop: true, castling: false }
            }
        }

        // if tile is out of bounds
        // if(tile.childNodes.length) {
        //     if(!tile.childNodes[0].classList.contains('opponent')) {
        //         return { tile: null, stop: true}
        //     }
        // }

        // loop through conditions
        conditions.forEach((obj) => {
            switch(obj){
                case CONDITION.initial:
                    if(!piece.isInitial) {
                        isTileValid = false;
                    }
                    break;
                case CONDITION.no_piece:
                    if(tile.childNodes.length) {
                        isTileValid = false;
                    }
                    break;
                case CONDITION.has_opponent:
                    if(!tile.childNodes.length) { // if no piece false and break
                        isTileValid = false;
                        break
                    } else {
                        if(!tile.childNodes[0].classList.contains('opponent')) { // if has piece but an ally false and break
                            isTileValid = false;
                            break
                        }
                    }
                    break
                case CONDITION.until_opponent: //////// LOOP CONDITIONS ////////////////////////////////////////////////////////////////////////////////
                    if(tile.childNodes.length) { // if has piece
                        stop = true;
                    }
                    break;
                case CONDITION.castling:
                    castling = true;
                    break;
                default:
                    break;
            }
        });
        return { tile: isTileValid ? tile : null, castling: castling, stop: stop };
    } else {
        return { tile: null, stop: true};
    }
}



const getValidTiles = (piece) => {

    let tiles = [];
    piece.rules.forEach((obj) => {

        // loop through rules -> get dom -> clash dom with conditions to see if tile survives
        let rra = obj.rule.split(/(:|=)/g);
        let ruleX, ruleY, xId, yId, tileObj;

        if (rra[1] === ':') {
            ruleX = rra[0].split('x')[1];
            ruleY = rra[2].split('y')[1];

            // possible loop for all directions?
            // if(ruleX === '*' || ruleY === '*'){
            //     for(let direction = 0; direction < 2; direction++){  // loop for both vertical tiles from piece; i.e up and down / left and right
            //         // if 
            //         for(let x = 0; x < 8; x++){
            //             // get x
                        
            //         }
            //         for(let y = 0; y < 8; y++){
            //             // get y

            //         }
            //         // get tile and clash with conditions
            //     }
            // }

            if (ruleX === '*') { // all tiles along x axis
                for(let isUp = 0; isUp < 2; isUp++){ // loop for both vertical tiles from piece; i.e up and down / left and right
                    for (let i = 0; i < 8; i++) { // get new x and y values from origin
                        xId = eval(piece.isLight ? `${piece.position.substring(1,2)}${isUp ? '+' : '-'}${i+1}` : `${piece.position.substring(1,2)}${isUp ? '+' : '-'}${i+1}`);
                        yId = piece.position.substring(0,1);
                        tileObj = testConditions(piece, getDomById(`t-${yId}${xId}`), obj.conditions);
                        if(tileObj.tile)
                            tiles.push(tileObj)
                        if(tileObj.stop)
                            break;
                    }
                }
            } else if (ruleY === "*") { // all tiles along y axis
                for(let isLeft = 0; isLeft < 2; isLeft++){ // loop for both horizontal tiles from piece
                    for (let i = 0; i < 8; i++) { // get new x and y values from origin
                        xId = piece.position.substring(1,2);
                        yId = String.fromCharCode(eval(piece.isLight ? `${piece.position.charCodeAt(0)}${isLeft ? '+' : '-'}${i+1}` : `${piece.position.charCodeAt(0)}${isLeft ? '-' : '+'}${i+1}`));
                        tileObj = testConditions(piece, getDomById(`t-${yId}${xId}`), obj.conditions);
                        if(tileObj.tile)
                            tiles.push(tileObj)
                        if(tileObj.stop)
                            break;
                    }
                }
            } else { // specific tile
                // get new x and y values from origin
                let x = eval(piece.x + (ruleX.length > 1 ? ruleX : "+0"));
                let y = eval(piece.y + (ruleY.length > 1 ? ruleY : "+0"));
                // convert depending on side to get correct id
                xId = piece.isLight ? (8 - x) : (1 + x);
                yId = String.fromCharCode(piece.isLight ? (65 + y) : (72 - y));
                // get dom
                tileObj = testConditions(piece, getDomById(`t-${yId}${(xId)}`), obj.conditions);
                if(tileObj.tile)
                    tiles.push(tileObj)
            }
        } else { // = tiles / diagonal
            for(let z = 0; z < 4; z++){
                let axis;
                switch(z){
                    case 0: axis = {x: '-', y: '-'}; break;
                    case 1: axis = {x: '-', y: '+'}; break;
                    case 2: axis = {x: '+', y: '-'}; break;
                    case 3: axis = {x: '+', y: '+'}; break;
                    default: break;
                }

                for(let i = 0; i < 8; i++){
                    xId = eval(piece.isLight ? `${piece.position.substring(1,2)}${axis.x}${i+1}` : `${piece.position.substring(1,2)}${axis.y}${i+1}`);
                    yId = String.fromCharCode(eval(piece.isLight ? `${piece.position.charCodeAt(0)}${axis.y}${i+1}` : `${piece.position.charCodeAt(0)}${axis.x}${i+1}`));
                    tileObj = testConditions(piece, getDomById(`t-${yId}${xId}`), obj.conditions);
                    if(tileObj.tile)
                        tiles.push(tileObj)
                    if(tileObj.stop)
                        break;
                }
            }
        }
    });
    return tiles;
}

const PIECE = {
    GET: {
        image: getPieceImage,
        validTiles: getValidTiles
    }
}

export default PIECE;