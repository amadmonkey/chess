// app
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReactComponent as PAWN_LIGHT } from '../../img/cute_light/pawn.svg';
import { ReactComponent as PAWN_DARK } from '../../img/cute_dark/pawn.svg';
import { ReactComponent as ROOK_LIGHT } from '../../img/cute_light/rook.svg';
import { ReactComponent as ROOK_DARK } from '../../img/cute_dark/rook.svg';
import { ReactComponent as KNIGHT_LIGHT } from '../../img/cute_light/knight.svg';
import { ReactComponent as KNIGHT_DARK } from '../../img/cute_dark/knight.svg';
import { ReactComponent as BISHOP_LIGHT } from '../../img/cute_light/bishop.svg';
import { ReactComponent as BISHOP_DARK } from '../../img/cute_dark/bishop.svg';
import { ReactComponent as QUEEN_LIGHT } from '../../img/cute_light/queen.svg';
import { ReactComponent as QUEEN_DARK } from '../../img/cute_dark/queen.svg';
import { ReactComponent as KING_LIGHT } from '../../img/cute_light/king.svg';
import { ReactComponent as KING_DARK } from '../../img/cute_dark/king.svg';

import Cookies from 'js-cookie';

// data
import API from '../../data/API.js';

// styles
import './Chess.scss';

const Chess = (props) => {
    let userDetails = props.data.userDetails;
    const hand = useRef(null);
    const [nodes, setNodes] = useState(null);
    const [onHand, setOnHand] = useState(null);
    const [turn, setTurn] = useState(props.data.turn);
    const [userSet, setUserSet] = useState(props.data.user);
    const [opponentSet, setOpponentSet] = useState(props.data.opponent);

    const getPieceImage = (params) => {
        switch (params.pieceName) {
            case "PAWN":
                return params.isLight ? <PAWN_LIGHT /> : <PAWN_DARK />;
            case "ROOK":
                return params.isLight ? <ROOK_LIGHT /> : <ROOK_DARK />;
            case "KNIGHT":
                return params.isLight ? <KNIGHT_LIGHT /> : <KNIGHT_DARK />;
            case "BISHOP":
                return params.isLight ? <BISHOP_LIGHT /> : <BISHOP_DARK />;
            case "QUEEN":
                return params.isLight ? <QUEEN_LIGHT /> : <QUEEN_DARK />;
            case "KING":
                return params.isLight ? <KING_LIGHT /> : <KING_DARK />;
        }
    }

    const generateBoard = () => {
        let holdingPiece = null;
        const chessDom = document.getElementById('chess');
        const handlePiece = (e, piece, position) => {
            debugger
            console.info('clicked on piece: ', piece);
            if (typeof piece === 'object') { // if clicked on a piece
                if (piece.isLight === !userDetails.isLight) { // if clicked on an opposing piece
                    if (holdingPiece) {
                        // eat
                    }
                } else { // if clicked on a user piece
                    if (!holdingPiece) { // if not holding any piece then pick up
                        holdingPiece = piece;
                        setOnHand(getPieceImage(holdingPiece));
                        document.getElementById(piece.id).classList.add('moving');
                        MOVE.START();
                    } else { // if already holding a piece
                        if (piece.id === holdingPiece.id) { // if clicked piece and holding piece is === then put down
                            holdingPiece = null;
                            document.getElementById(piece.id).classList.remove('moving');
                            MOVE.END();
                        } else {
                            // i could put here: if clicked piece and holding piece is !== then swap. not priority
                        }
                    }
                }
            } else { // if clicked on a node
                if (holdingPiece) {
                    API.SOCKET.CHESS.MOVE({ id: holdingPiece.id, position: position });
                    holdingPiece = null;
                    MOVE.END();
                }
            }
        }

        const movePiece = (e) => {
            let currentHand = hand.current.style;
            let left = (chessDom.getBoundingClientRect().left + 50);
            let top = (chessDom.getBoundingClientRect().top + 50);
            currentHand.left = (e.pageX - left) + 'px';
            currentHand.top = (e.pageY - top) + 'px';
            currentHand.display = "block";
        }

        const MOVE = {
            START: () => document.addEventListener('mousemove', movePiece),
            END: () => {
                document.removeEventListener('mousemove', movePiece);
                let currentHand = hand.current.style;
                currentHand.display = "none";
                currentHand.left = '0px';
                currentHand.top = '0px';
            }
        }

        const createNode = (attr, content) => { return React.createElement('li', attr, content) }
        const createPiece = (attr, content) => { return React.createElement('div', attr, content) }
        let tempNodes = [];
        for (let x = 0; x < 8; x++) {
            let row = [];
            let nmr = userDetails.isLight ? (8 - x) : (1 + x);
            for (let y = 0; y < 8; y++) {
                let ltr = userDetails.isLight ? (65 + y) : (72 - y);
                let position = `${String.fromCharCode(ltr)}${nmr}`;
                let user = userSet.filter(obj => obj.position === position)[0];
                let opponent = opponentSet.filter(obj => obj.position === position)[0];

                let node = null, piece = null;
                let id = `n-${String.fromCharCode(ltr)}${nmr}`;
                if (user) { // if node has user's piece
                    piece = createPiece({ id: user.id, className: 'chess-piece' }, getPieceImage(user));
                } else if (opponent) { // if node has opponent's piece
                    piece = createPiece({ id: opponent.id, className: 'chess-piece opponent' }, getPieceImage(opponent));
                }
                node = createNode({ key: ltr, id: id, onClick: (e) => handlePiece(e, user ? user : position, position), className: "node" }, piece);
                row.push(node)
            }
            tempNodes.push(row);
        }
        setNodes(tempNodes);
    }

    useEffect(() => {
        API.SOCKET.LINK.on('chess-move-response', (turn, setUser, setOpponent) => {
            debugger
            setTurn(turn);
            if (setUser[0].isLight === userDetails.isLight) {
                Cookies.set('set_user', JSON.stringify(setUser));
                Cookies.set('set_opponent', JSON.stringify(setOpponent));
                setUserSet(setUser);
                setOpponentSet(setOpponent);
            } else {
                Cookies.set('set_user', JSON.stringify(setOpponent));
                Cookies.set('set_opponent', JSON.stringify(setUser));
                setUserSet(setOpponent);
                setOpponentSet(setUser);
            }
        });
    }, []);

    useEffect(() => {
        generateBoard();
    }, [userSet, opponentSet])

    return userDetails ? (
        <div className="chess-container">
            <div className="graveyard opponent"></div>
            <div id="chess" className={`chess ${turn === userDetails.isLight ? 'turn-user' : 'turn-opponent'}`}>
                <ul>
                    {nodes ? nodes : "Loading"}
                </ul>
                <div id="hand" className="hand" ref={hand}>{onHand}</div>
            </div>
            <div className="graveyard user"></div>
        </div>
    ) : "Loading"
}

export default Chess
