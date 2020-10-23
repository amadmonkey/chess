// data
import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie';

// components
import { ReactComponent as KING_DARK } from '../../img/cute_dark/king.svg';
import { ReactComponent as QUEEN_DARK } from '../../img/cute_dark/queen.svg';
import { ReactComponent as PAWN_DARK } from '../../img/cute_dark/pawn.svg';
import { ReactComponent as CHESS_SEARCHING } from '../../img/chess-searching.svg';
import { ReactComponent as Copy } from '../../img/copy.svg';
import { ReactComponent as Error } from '../../img/error.svg';

// data
import API from '../../data/API.js';

// styles
import './Login.scss';

const Login = (props) => {
    let history = useHistory(null);
    let codeInput = useRef(null);
    let copied = useRef(null);
    let waitingModal = useRef(null);
    const [nicknameValue, setNicknameValue] = useState("");
    const [roomId, setRoomId] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        if (nicknameValue && !roomId) {
            // make new room
            API.SOCKET.CREATE_ROOM({ nickname: nicknameValue });
        } else if (nicknameValue && roomId) {
            // join existing room
            API.SOCKET.JOIN_ROOM({ nickname: nicknameValue, roomId: roomId });
        } else {
            // show errors
        }
    }

    const handleInput = (e) => {
        switch (e.currentTarget.id) {
            case "_nickname":
                setNicknameValue(e.target.value);
                break;
            case "_roomId":
                setRoomId(e.target.value);
                break;
            default:
                break;
        }
    }

    const copyToClipboard = (e) => {
        codeInput.current.select();
        document.execCommand('copy');
        copied.current.classList.add('active');
        setTimeout(() => {
            if (copied) {
                if (copied.current) {
                    copied.current.classList.remove('active');
                }
            }
        }, 1000);
        e.target.blur();
        console.log('Copied to clipboard');
    }

    const handleLogout = () => {
        Cookies.remove('roomId');
        waitingModal.current.style.display = 'none';
        API.SOCKET.CANCEL_ROOM({ roomId: codeInput.current.value });
        codeInput.current.value = "";
    }

    // if (props.location.state) {
    // switch (props.location.state.status) {
    //     case 'canceled':
    //         alert('Game canceled');
    //         break;
    //     default:
    //         break;
    // }
    // history.replace('', null);
    // }

    useEffect(() => {

        Cookies.get('roomId') && history.push('/');

        API.SOCKET.LINK.on("create-room-response", function (params) {
            console.info('created room ', params);
            Cookies.set('roomId', params.roomId);
            codeInput.current.value = params.roomId;
            waitingModal.current.style.display = 'block';
            // if (codeInput.current) { codeInput.current.value = params.userDetails.roomId }
            // if (waitingModal.current) { waitingModal.current.style.display = 'block' }
        });

        API.SOCKET.LINK.on("join-room-response", function (params) {
            if (params) {
                console.info('joined room ', params);
                if (Cookies.get('roomId')) {
                    // if the host is receiving
                    Cookies.set('user', JSON.stringify(params.host));
                    Cookies.set('opponent', JSON.stringify(params.guest));
                } else {
                    // if the guest is receiving
                    Cookies.set('roomId', params.roomId)
                    Cookies.set('user', JSON.stringify(params.guest));
                    Cookies.set('opponent', JSON.stringify(params.host));
                }
                // go to home
                history.push('/', params);
            } else {
                // either incorrect roomId or room already has 2 clients
                alert('room does not exist');
            }
        });

    }, [])

    return (
        <div className="login-container">
            <div className="form-container">
                <header>
                    <PAWN_DARK />
                    <KING_DARK />
                    <QUEEN_DARK />
                </header>
                <form onSubmit={(e) => handleLogin(e)}>
                    <label htmlFor="_nickname">Nickname</label>
                    <input placeholder="Nickname" type="text" id="_nickname" value={nicknameValue} onChange={(e) => handleInput(e)} autoFocus />
                    <label htmlFor="_roomId">Room ID</label>
                    <input placeholder="Room Code" type=" text" id="_roomId" value={roomId} onChange={(e) => handleInput(e)} />
                    <button type="submit">ENTER</button>
                </form>
                <footer>
                    <a href="https://www.flaticon.com/authors/smashicons" target="_blank" title="Smashicons">Smashicons</a>
                    <a href="https://www.flaticon.com/authors/eucalyp" target="_blank" title="Eucalyp">Eucalyp</a>
                    <a href="https://www.flaticon.com/authors/freepik" target="_blank" title="Freepik">Freepik</a>
                    <a href="https://www.iconfinder.com">iconfinder</a>
                </footer>
            </div>
            <div className="login-overlay" ref={waitingModal}>
                <div>
                    <CHESS_SEARCHING className="orbit" />
                    <span>Waiting for opponent...</span>
                    <div>
                        <input className="code-input" ref={codeInput} onClick={(e) => copyToClipboard(e)} readOnly />
                        <Copy />
                        <div className="copied" ref={copied}>Copied to clipboard!</div>
                    </div>
                    <button type="button" onClick={(e) => handleLogout(e)}><Error /></button>
                </div>
            </div>
        </div>
    )
}

export default Login
