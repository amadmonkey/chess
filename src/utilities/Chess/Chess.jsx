// app
import React, { useState, useEffect, useCallback, useRef } from 'react';

// data
import Set from '../../data/CHESS_PIECES';

// styles
import './Chess.scss';

const Chess = (props) => {
    let userDetails = props.userDetails;
    let SET = Set({ isLight: userDetails.isLight, isOpponent: false });
    let SET_OPPONENT = Set({ isLight: !userDetails.isLight, isOpponent: true });
    let holdingPiece = null;
    const hand = useRef(null);
    const [nodes, setNodes] = useState(null);
    const createNode = (attr, content) => { return React.createElement('li', attr, content) }

    const handlePiece = (e, piece, x, y) => {
        console.info('clicked on piece: ', piece);
        if (typeof piece === "object") { // if clicked on a piece
            if (piece.isOpponent) { // if clicked on an opposing piece
                if (holdingPiece) {
                    // eat
                }
            } else { // if clicked on an the user's piece
                if (!holdingPiece) {
                    holdingPiece = piece;
                    hand.current.textContent = holdingPiece.pieceName;
                    let tesdt = document.getElementById(piece.id);
                    document.getElementById('p-' + piece.position).classList.add('moving');
                    MOVE.START();
                } else {

                }
            }
        } else { // if clicked on a node
            if (holdingPiece) {
                // move piece
                // call db
                SET.map(obj => {
                    if (obj.id === holdingPiece.id) {
                        obj.position = piece.split('n-')[1];
                    }
                })
                holdingPiece = null;
                generateBoard();
                MOVE.END();
                let currentHand = hand.current.style;
                currentHand.display = "none";
                currentHand.left = '0px';
                currentHand.top = '0px';
            }
        }
    }

    const movePiece = (e) => {
        let currentHand = hand.current.style;
        currentHand.left = (e.pageX - 50) + 'px';
        currentHand.top = (e.pageY - 50) + 'px';
        currentHand.display = "block";
    }

    const MOVE = {
        START: () => document.addEventListener('mousemove', movePiece),
        END: () => document.removeEventListener('mousemove', movePiece)
    }

    const generateBoard = useCallback(() => {
        const createNode = (attr, content) => { return React.createElement('li', attr, content) }
        const createPiece = (attr, content) => { return React.createElement('div', attr, content) }
        let tempNodes = [];
        for (let x = 0; x < 8; x++) {
            let row = [];
            let nmr = userDetails.isLight ? (8 - x) : (1 + x);
            for (let y = 0; y < 8; y++) {
                let ltr = userDetails.isLight ? (65 + y) : (72 - y);
                let position = `${String.fromCharCode(ltr)}${nmr}`;
                let user = SET.filter(obj => obj.position === position)[0];
                let opponent = SET_OPPONENT.filter(obj => obj.position === position)[0];
                let piece;
                let id = `n-${String.fromCharCode(ltr)}${nmr}`;
                if (user) {
                    piece = createNode(
                        { key: ltr, id: id, onClick: (e) => handlePiece(e, user, x, y), className: "node" },
                        createPiece({ id: `p-${user.position}`, className: `chess-piece ${user.isOpponent ? "opponent" : ""}` }, `${user.pieceName}`)
                    );
                } else if (opponent) {
                    piece = createNode(
                        { key: ltr, id: id, onClick: (e) => handlePiece(e, user, x, y), className: "node" },
                        createPiece({ id: `p-${opponent.position}`, className: `chess-piece ${opponent.isOpponent ? "opponent" : ""}` }, `${opponent.pieceName}`)
                    );
                } else {
                    piece = createNode(
                        { key: ltr, id: id, onClick: (e) => handlePiece(e, id, x, y), className: "node" },
                        createPiece(null, position)
                    );
                }
                row.push(piece)
            }
            tempNodes.push(row);
        }
        setNodes(tempNodes);
    }, [userDetails])

    useEffect(() => {
        generateBoard();
    }, [generateBoard])

    return (
        <div className="chess-container">
            <ul>
                {nodes ? nodes : "Loading"}
            </ul>
            <div className="hand" ref={hand}></div>
        </div>
    )
}

export default Chess
