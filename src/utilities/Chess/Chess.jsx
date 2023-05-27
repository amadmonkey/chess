// app
import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

// data
import API from '../../data/API.js';
import PIECE from '../../data/PIECE_HELPER.js';

// styles
import './Chess.scss';
import UserInfo from '../UserInfo/UserInfo';

const Chess = (props) => {
    let d = props.data;
    const user = JSON.parse(Cookies.get('user'));
    const opponent = JSON.parse(Cookies.get('opponent'));
    let holdingPiece = null;
    const handRef = useRef(null);
    const copied = useRef(null);
    const [turn, setTurn] = useState(d.turn);
    const [userSet, setUserSet] = useState(d.set[user.isLight ? 'LIGHT' : 'DARK']);
    const [opponentSet, setOpponentSet] = useState(d.set[user.isLight ? 'DARK' : 'LIGHT']);
    const [tiles, setTiles] = useState(null);
    const [onHandImage, setOnHandImage] = useState(null);
    const [xLegend, setXLegend] = useState([]);
    const [yLegend, setYLegend] = useState([]);
    const createTile = (attr, content) => { return React.createElement('li', attr, content) }
    const createPiece = (attr, content) => { return React.createElement('div', attr, content) }
    const getDomById = (id) => document.getElementById(id);

    const handlePieceClick = (piece, position) => {
        let dom = position.currentTarget;
        if (user.isLight === turn) { // if it's your turn
            if (typeof piece === 'object') { // if clicked on a piece
                if (piece.isLight === !user.isLight) { // if clicked on an opposing piece
                    if (holdingPiece && dom.classList.contains('valid-tile')) { // if holding a piece then eat
                        // capture
                        API.SOCKET.CHESS.MOVE({ user: user, holdingPiece: holdingPiece, opponentPiece: piece, roomId: d.roomId, newPosition: dom.id.split('-')[1] });
                        MOVE.END(piece);
                    }
                } else { // if clicked on a user piece
                    if (!holdingPiece) { // if not holding any piece then pick up
                        if (piece.validTiles.length > 1) {
                            MOVE.START(piece);
                        }
                    } else { // if already holding a piece
                        piece.id === holdingPiece.id && MOVE.END(piece);
                    }
                }
            } else { // if clicked on a tile
                if (holdingPiece && dom.classList.contains('valid-tile')) { // if holding a piece then move 
                    API.SOCKET.CHESS.MOVE({ user: user, holdingPiece: holdingPiece, opponentPiece: null, roomId: d.roomId, newPosition: dom.id.split('-')[1] });
                    MOVE.END(holdingPiece);
                }
            }
        }
    }

    const showValidTiles = (tiles) => {
        if (!holdingPiece && tiles.length > 1 && turn === user.isLight) {
            getDomById('chess').classList.add('overlay');
            tiles.forEach((obj) => {
                getDomById(`t-${obj.tile}`).classList.add('valid-tile', obj.type);
            });
        }
    }

    const removeValidTiles = (tiles) => {
        if (!holdingPiece && tiles) {
            getDomById('chess').classList.remove('overlay');
            document.querySelectorAll('.tile').forEach(obj => obj.classList.remove(...Object.values(d.constants.MOVE_TYPE), 'valid-tile'));
        }
    }

    const movePiece = (e) => {
        let currentHand = handRef.current.style;
        let boundingClientRect = getDomById('chess').getBoundingClientRect();
        let left = boundingClientRect.left + (getDomById('hand').offsetHeight / 1.5);
        let top = boundingClientRect.top + (getDomById('hand').offsetHeight / 2);
        currentHand.left = `${e.pageX - left}px`;
        currentHand.top = `${e.pageY - top}px`;
        currentHand.display = "block";
    }

    const MOVE = {
        START: (piece) => {
            document.addEventListener('mousemove', movePiece);
            holdingPiece = piece;
            setOnHandImage(PIECE.GET.image(piece));
            getDomById(piece.id).classList.add('moving');
            showValidTiles(piece.validTiles);
        },
        END: (piece) => {
            document.removeEventListener('mousemove', movePiece);
            holdingPiece = null;
            getDomById(piece.id).classList.remove('moving');
            removeValidTiles(piece.validTiles);
            let currentHand = handRef.current.style;
            currentHand.left = '0px';
            currentHand.top = '0px';
            currentHand.display = "none";
        }
    }

    useEffect(() => {
        let isMounted = true;
        API.SOCKET.LINK.on('chess-move-response', (turn, userSet, opponentSet, done) => {
            if (isMounted) {
                setTurn(turn);
                if (userSet[0].isLight === user.isLight) {
                    setUserSet(userSet);
                    setOpponentSet(opponentSet);
                } else {
                    setUserSet(opponentSet);
                    setOpponentSet(userSet);
                }
            }
        });
        return () => {
            isMounted = false;
            API.SOCKET.LINK.off('chess-move-response');
        }
    }, [turn, userSet, user]);

    useEffect(() => {
        let timer;
        const elem = copied.current;
        elem.classList.toggle('active');
        if (turn === user.isLight) {
            elem.innerText = 'Your Turn';
            elem.classList.add(user.isLight ? 'bg-light' : 'bg-dark');
        } else {
            elem.innerText = "Opponent's Turn";
            elem.classList.add(user.isLight ? 'bg-dark' : 'bg-light');
        }
        timer = setTimeout(() => {
            if (copied) {
                if (elem) {
                    elem.classList.toggle('active');
                    elem.classList.remove('bg-light');
                    elem.classList.remove('bg-dark');
                }
            }
        }, 1000);
        return () => {
            clearTimeout(timer);
        }
    }, [turn])

    useEffect(() => {
        let updatedTiles = [];
        for (let x = 0; x < 8; x++) {
            let row = [], nmr = user.isLight ? (8 - x) : (1 + x);
            !xLegend.length && setXLegend(xLegend => [...xLegend, React.createElement('div', { key: `x${x}` }, React.createElement('span', null, nmr))]);
            for (let y = 0; y < 8; y++) {
                let ltr = user.isLight ? (65 + y) : (72 - y), position = `${String.fromCharCode(ltr)}${nmr}`;
                let tile = null, piece = null, tileId = `t-${String.fromCharCode(ltr)}${nmr}`;
                let opponent_piece = opponentSet.filter(obj => obj.active && obj.position === position)[0];
                let user_piece = userSet.filter(obj => obj.active && obj.position === position)[0];

                if (user_piece) {
                    piece = createPiece({ id: user_piece.id, style: { cursor: user_piece.validTiles.length > 1 ? 'grab' : 'not-allowed' }, className: `chess-piece ${user_piece.validTiles.length > 1 ? 'has-moves' : ''}`, onMouseOver: (e) => showValidTiles(user_piece.validTiles), onMouseLeave: () => removeValidTiles(user_piece.validTiles) }, PIECE.GET.image(user_piece))
                } else if (opponent_piece) {
                    piece = createPiece({ id: opponent_piece.id, className: `chess-piece opponent` }, PIECE.GET.image(opponent_piece))
                }

                (x === 0 && !yLegend.length) && setYLegend(yLegend => [...yLegend, React.createElement('span', { key: `y${y}` }, String.fromCharCode(ltr))]);
                tile = createTile({ key: `${x}${y}`, id: tileId, onClick: (e) => handlePieceClick(user_piece ? user_piece : opponent_piece, e), className: `tile ${(x % 2 === 0) === (y % 2 === 0) ? 'light' : 'dark'}` }, [piece, React.createElement('div', {className: 'interact-icon'})]);
                row.push(tile)
            }
            updatedTiles.push(row);
        }
        setTiles(updatedTiles);
    }, [userSet, opponentSet])

    return (
        <section className="chess-container">
            <UserInfo data={opponent}>
                <div className="graveyard opponent">
                    {userSet.map((obj, i) => !obj.active && React.createElement('div', { key: i }, PIECE.GET.image(obj)))}
                </div>
            </UserInfo>
            <div id="chess" className={`chess ${turn === user.isLight ? 'turn-user' : ''}`}>
                <legend className="legend x">{xLegend}</legend>
                <legend className="legend y">{yLegend}</legend>
                <ul className="tiles">
                    {tiles ? tiles : "Loading"}
                </ul>
                <div id="hand" className="hand" ref={handRef}>{onHandImage}</div>
            </div>
            <UserInfo data={user} you handleDone={props.handleDone}>
                <div className="graveyard user">
                    {opponentSet.map((obj, i) => !obj.active && React.createElement('div', { key: i }, PIECE.GET.image(obj)))}
                </div>
            </UserInfo>
            <div className="copied" ref={copied}>Your turn</div>
        </section>
    )
}

export default Chess
