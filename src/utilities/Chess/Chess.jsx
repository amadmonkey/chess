// app
import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

// data
import API from '../../data/API.js';
import PIECE_IMAGES from '../../data/PIECE_IMAGES.js';

// styles
import './Chess.scss';

const Chess = (props) => {
    let d = props.data;
    let user = JSON.parse(props.user);
    let opponent = JSON.parse(props.opponent);
    let holdingPiece = null;
    const handRef = useRef(null);
    const [turn, setTurn] = useState(d.turn);
    const [userSet, setUserSet] = useState(d.set[user.isLight ? 'light' : 'dark']);
    const [opponentSet, setOpponentSet] = useState(d.set[user.isLight ? 'dark' : 'light']);
    const [tiles, setTiles] = useState(null);
    const [onHandImage, setOnHandImage] = useState(null);
    const createTile = (attr, content) => { return React.createElement('li', attr, content) }
    const createPiece = (attr, content) => { return React.createElement('div', attr, content) }
    const getDomById = (id) => document.getElementById(id);

    const handlePieceClick = (piece, position) => {
        if (typeof piece === 'object') { // if clicked on a piece
            if (piece.isLight === !user.isLight) { // if clicked on an opposing piece
                if (holdingPiece) { // if holding a piece then eat
                    // eat
                    API.SOCKET.CHESS.MOVE({ user: user, holdingPiece: holdingPiece, opponentPiece: piece, roomId: d.roomId, newPosition: position });
                    MOVE.END(piece);
                }
            } else { // if clicked on a user piece
                if (!holdingPiece) { // if not holding any piece then pick up
                    MOVE.START(piece);
                } else { // if already holding a piece
                    if (piece.id === holdingPiece.id) { // if clicked piece and holding piece is === then put down
                        MOVE.END(piece);
                    } else {
                        // i could put here: if clicked piece and holding piece is !== then swap. not priority
                    }
                }
            }
        } else { // if clicked on a tile
            if (holdingPiece) {
                API.SOCKET.CHESS.MOVE({ user: user, holdingPiece: holdingPiece, opponentPiece: null, roomId: d.roomId, newPosition: position });
                MOVE.END(holdingPiece);
            }
        }
    }

    const applyRules = (piece) => {

        const getPosition = (ra) => {
            let ruleX = ra[0].split('x')[1];
            let ruleY = ra[2].split('y')[1];
            let doms = [];
            let xId, yId;

            if (ruleX === '*' || ruleY === '*') { // has all; loop
                if (ruleX === '*' && ruleY === '*') {

                } else if (ruleX === '*') {
                    for (let i = 0; i < 8; i++) {
                        xId = piece.isLight ? (8 - i) : (1 + i);
                    }
                } else {

                }
            } else { // single
                let x = eval(piece.x + (ruleX.length > 1 ? ruleX : "+0"));
                let y = eval(piece.y + (ruleY.length > 1 ? ruleY : "+0"));
                xId = piece.isLight ? (8 - x) : (1 + x);
                yId = String.fromCharCode(piece.isLight ? (65 + y) : (72 - y));
                let dom = getDomById(`t-${yId}${(xId)}`)
                dom && doms.push(dom);
            }
            return doms;
        }

        piece.rules.forEach((obj) => {
            if (typeof obj === "string") { // normal conditions
                let ruleArray = obj.split(/(:|=)/g);
                if (ruleArray[1] === ":") {
                    getPosition(ruleArray).forEach(obj => {
                        obj.classList.add('valid-tile');
                    });
                } else {
                    // deal with =
                }
            } else { // special conditions e.g. pawn moving diagonally wheneating, castling
                let ruleArray = obj.rule.split(/(:|=)/g);
                switch (obj.condition) {
                    case "INITIAL":
                        if (piece.isInitial) {
                            getPosition(ruleArray).forEach(obj => {
                                obj.classList.add('valid-tile');
                            });
                        }
                        break;
                    case "NO_PIECE":
                        getPosition(ruleArray).forEach(obj => {
                            if (!obj.childNodes.length) {
                                obj.classList.add('valid-tile');
                            }
                        });
                        break;
                    case "HAS_OPPONENT":
                        getPosition(ruleArray).forEach(obj => {
                            if (obj.childNodes.length) {
                                if (obj.childNodes[0].classList.contains('opponent')) {
                                    obj.classList.add('valid-tile');
                                }
                            }
                        });
                    case "UNTIL_OPPONENT":
                        getPosition(ruleArray).forEach(obj => {

                        });
                        break;
                }
            }
        });

    }

    const movePiece = (e) => {
        let currentHand = handRef.current.style;
        let boundingClientRect = getDomById('chess').getBoundingClientRect();
        let left = boundingClientRect.left + 60;
        let top = boundingClientRect.top + 80;
        currentHand.left = `${e.pageX - left}px`;
        currentHand.top = `${e.pageY - top}px`;
        currentHand.display = "block";
    }

    const MOVE = {
        START: (piece) => {
            document.addEventListener('mousemove', movePiece);
            holdingPiece = piece;
            setOnHandImage(PIECE_IMAGES.GET(piece));
            getDomById(piece.id).classList.add('moving');
            getDomById('chess').classList.add('overlay');
            // applyRules(piece);
        },
        END: (piece) => {
            document.removeEventListener('mousemove', movePiece);
            holdingPiece = null;
            getDomById(piece.id).classList.remove('moving');
            getDomById('chess').classList.remove('overlay');
            document.querySelectorAll('.tile').forEach((obj) => {
                obj.classList.remove('valid-tile');
            });
            let currentHand = handRef.current.style;
            currentHand.display = 'none';
            currentHand.left = '0px';
            currentHand.top = '0px';
        }
    }

    const generateBoard = () => {
        let newTiles = [];
        for (let x = 0; x < 8; x++) {
            let row = [], nmr = user.isLight ? (8 - x) : (1 + x);
            for (let y = 0; y < 8; y++) {
                let ltr = user.isLight ? (65 + y) : (72 - y), position = `${String.fromCharCode(ltr)}${nmr}`;
                let tile = null, piece = null, tileId = `t-${String.fromCharCode(ltr)}${nmr}`;

                let opponent_piece = opponentSet.filter(obj => obj.active && obj.position === position)[0];
                let user_piece = userSet.filter(obj => obj.active && obj.position === position)[0];
                if (user_piece) {
                    user_piece.x = (x); user_piece.y = (y);
                    piece = createPiece({ id: user_piece.id, className: `chess-piece` }, PIECE_IMAGES.GET(user_piece))
                } else if (opponent_piece) {
                    opponent_piece.x = (x); opponent_piece.y = (y);
                    piece = createPiece({ id: opponent_piece.id, className: 'chess-piece opponent' }, PIECE_IMAGES.GET(opponent_piece))
                }

                tile = createTile({ key: ltr, id: tileId, onClick: () => handlePieceClick(user_piece ? user_piece : opponent_piece, position), className: `tile ${(x % 2 === 0) === (y % 2 === 0) ? 'light' : 'dark'}` }, piece);
                row.push(tile)
            }
            newTiles.push(row);
        }
        setTiles(newTiles);
    }

    useEffect(() => {
        API.SOCKET.LINK.on('chess-move-response', (turn, userSet, opponentSet) => {
            console.info('user', userSet);
            console.info('opponentSet', opponentSet);
            setTurn(turn);
            if (userSet[0].isLight === user.isLight) {
                setUserSet(userSet);
                setOpponentSet(opponentSet);
            } else {
                setUserSet(opponentSet);
                setOpponentSet(userSet);
            }
        });
    }, [userSet]);

    useEffect(() => {
        generateBoard();
    }, [userSet, opponentSet])

    return (
        <div className="chess-container">
            <div className="graveyard-container">
                <div className="graveyard opponent">{userSet.map(obj => { return !obj.active && React.createElement('div', null, PIECE_IMAGES.GET(obj)) })}</div>
                <div id="chess" className={`chess ${turn === user.isLight ? 'turn-user' : 'turn-opponent'}`}>
                    <ul className="tiles">
                        {tiles ? tiles : "Loading"}
                    </ul>
                    <div id="hand" className="hand" ref={handRef}>{onHandImage}</div>
                </div>
                <div className="graveyard user">{opponentSet.map(obj => { return !obj.active && React.createElement('div', null, PIECE_IMAGES.GET(obj)) })}</div>
            </div>
        </div>
    )
}

export default Chess
