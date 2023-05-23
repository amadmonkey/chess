// data
import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie';

// components
import { ReactComponent as KING_DARK } from '../../img/cute_dark/king.svg';
import { ReactComponent as KING_LIGHT } from '../../img/cute_light/king.svg';
import { ReactComponent as Copy } from '../../img/copy.svg';

// data
import API from '../../data/API.js';

// styles
import './Login.scss';

const Login = () => {
    let history = useHistory(null);
    const codeInput = useRef(null);
    const copied = useRef(null);
    const waitingModal = useRef(null);
    const [nicknameValue, setNicknameValue] = useState("");
    const [nicknameError, setNicknameError] = useState(null);
    const [roomId, setRoomId] = useState("");

    (Cookies.get('roomId') && Cookies.get('user')) && history.push('/');

    const handleLogin = (e) => {
        e.preventDefault();
        if (nicknameValue && !roomId) {
            // make new room
            document.getElementById('form-submit').disabled = true;
            document.getElementById('form-submit').classList.toggle('disabled');
            document.getElementById('form-submit').textContent = "";
            API.SOCKET.CREATE_ROOM({ nickname: nicknameValue });
        } else if (nicknameValue && roomId) {
            // join existing room
            document.getElementById('form-submit').disabled = true;
            document.getElementById('form-submit').classList.toggle('disabled');
            document.getElementById('form-submit').textContent = "";
            API.SOCKET.JOIN_ROOM({ nickname: nicknameValue, roomId: roomId });
        } else {
            setNicknameError("Please enter nickname");
        }
    }

    const handleInput = (e) => {
        setNicknameError(null);
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
        e.stopPropagation();
        let timer = null;
        navigator.clipboard.writeText(codeInput.current.value).then(() => {
            copied.current.classList.add('active');
            timer = setTimeout(() => {
                if (copied) {
                    if (copied.current) {
                        copied.current.classList.remove('active');
                    }
                }
            }, 1000);
        }).catch((err) => {
            console.log(err);
            alert("err"); // error
        });
        e.target.blur();
        return () => {
            clearTimeout(timer);
        }
    }

    const handleLogout = (e) => {
        e.stopPropagation();
        Cookies.remove('roomId');
        waitingModal.current.classList.toggle('active');
        document.getElementById('form-submit').disabled = false;
        document.getElementById('form-submit').classList.toggle('disabled');
        document.getElementById('form-submit').textContent = "PLAY";
        API.SOCKET.LEAVE_ROOM({ roomId: codeInput.current.value });
        codeInput.current.value = "";
    }

    const parsePaste = (e) => {
        setRoomId(e.clipboardData.getData('Text').replace(/[^a-zA-Z0-9]/ig, "").substring(0, 4));
    }

    const parseRoomId = (e, n) => {
        if (e.target.value) {
            let test = roomId.replaceAt(n, e.target.value);
            setRoomId(test);
            codeInputFocus('ADD', n);
        } else {
            setRoomId(roomId.slice(0, -1));
            codeInputFocus('DELETE', n);
        }
    }

    const codeInputFocus = (path, i) => {
        let codeInputItem = document.querySelectorAll('.code-input-item');
        codeInputItem[path === 'DELETE' ? (i - (i === 0 ? 0 : 1)) : (i + (i === 3 ? 0 : 1))].focus();
    }

    useEffect(() => {
        let isMounted = true;
        API.SOCKET.LINK.on("create-room-response", function (params) {
            Cookies.set('roomId', params.roomId);
            isMounted && (document.getElementById('code-input').value = params.roomId);
            if (waitingModal) {
                waitingModal.current && waitingModal.current.classList.toggle('active');
            }
        });
        return () => {
            isMounted = false;
            API.SOCKET.LINK.off('create-room-response');
        };
    }, [])

    useEffect(() => {
        let isMounted = true;
        API.SOCKET.LINK.on("join-room-response", function (params, user) {
            if (isMounted) {
                document.getElementById('form-submit').disabled = false;
                document.getElementById('form-submit').classList.toggle('disabled');
                document.getElementById('form-submit').textContent = "ENTER";
                if (typeof params === 'object') {
                    if (Cookies.get('roomId') && document.getElementById('_nickname')) {
                        // if the host is receiving
                        Cookies.set('user', JSON.stringify(params.host));
                        Cookies.set('opponent', JSON.stringify(params.guest));
                    } else if (document.getElementById('_nickname')) {
                        // if the guest is receiving
                        Cookies.set('roomId', params.roomId)
                        Cookies.set('user', JSON.stringify(params.guest));
                        Cookies.set('opponent', JSON.stringify(params.host));
                    }
                    history.push('/', params);
                } else {
                    //show error
                    alert(params);
                }
            }
        });
        return () => {
            isMounted = false;
            API.SOCKET.LINK.off('join-room-response');
        };
    })

    return (
        <div className="login-container">
            <div className="form-container">
                <header>
                    <KING_DARK />
                    <KING_LIGHT />
                    <h1 className="main-title">Play Chess?</h1>
                </header>
                <form onSubmit={(e) => handleLogin(e)}>
                    <div className="form-group">
                        <label htmlFor="_nickname">Enter Nickname</label>
                        <input placeholder="Nickname" type="text" id="_nickname" maxLength="10" autoComplete="off" className={nicknameError ? 'error' : ''} value={nicknameValue} onChange={(e) => handleInput(e)} autoFocus />
                        <label htmlFor="_nickname" className="form-error">{nicknameError}</label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="_roomId">Room ID</label>
                        <div className="code-input-container">
                            <input type="text" className="code-input-item" maxLength="1" autoComplete="off" value={roomId.substring(0, 1)} onPaste={(e) => parsePaste(e)} onChange={(e) => parseRoomId(e, 0)} />
                            <input type="text" className="code-input-item" maxLength="1" autoComplete="off" value={roomId.substring(1, 2)} onPaste={(e) => parsePaste(e)} onChange={(e) => parseRoomId(e, 1)} />
                            <input type="text" className="code-input-item" maxLength="1" autoComplete="off" value={roomId.substring(2, 3)} onPaste={(e) => parsePaste(e)} onChange={(e) => parseRoomId(e, 2)} />
                            <input type="text" className="code-input-item" maxLength="1" autoComplete="off" value={roomId.substring(3, 4)} onPaste={(e) => parsePaste(e)} onChange={(e) => parseRoomId(e, 3)} />
                        </div>
                        <label htmlFor="_roomId" className="form-description">Leave this blank if you're making a lobby</label>
                    </div>
                    <button type="submit" id="form-submit">PLAY</button>
                </form>
                <div className="links">
                    <a href="https://www.flaticon.com/authors/smashicons" target="_blank" rel="noopener noreferrer" title="Smashicons">Smashicons</a>
                    <a href="https://www.flaticon.com/authors/eucalyp" target="_blank" rel="noopener noreferrer" title="Eucalyp">Eucalyp</a>
                    <a href="https://www.flaticon.com/authors/freepik" target="_blank" rel="noopener noreferrer" title="Freepik">Freepik</a>
                    <a href="https://www.iconfinder.com">iconfinder</a>
                    <span className="copyright"></span>
                </div>
            </div>
            <div className="login-overlay" ref={waitingModal} onClick={(e) => handleLogout(e)}>
                <div className="code-container">
                    <div>
                        <Copy />
                        <input className="code-input" id="code-input" ref={codeInput} onClick={(e) => copyToClipboard(e)} readOnly />
                        <div className="copied" ref={copied}>Copied to clipboard!</div>
                    </div>
                    <span>Waiting for opponent...</span>
                    <p>Copy the code and send it to a friend to start playing!</p>
                    <button type="button" onClick={(e) => handleLogout(e)}>Close</button>
                </div>
            </div>
        </div>
    )
}

export default Login
