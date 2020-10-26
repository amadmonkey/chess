// app
import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie';

// components
import { ReactComponent as Send } from '../../img/send.svg';
import { ReactComponent as Settings } from '../../img/settings.svg';
import { ReactComponent as Flag } from '../../img/flag.svg';
import { ReactComponent as Copy } from '../../img/copy.svg';
import { ReactComponent as Reload } from '../../img/reload.svg';
import { ReactComponent as Start } from '../../img/chat-start.svg';
import { ReactComponent as Move } from '../../img/chat-move.svg';
import { ReactComponent as Battle } from '../../img/chat-blades.svg';
import { ReactComponent as Castle } from '../../img/chess-castling.svg';

// data
import API from '../../data/API.js';

// styles
import "./Chat.scss";

const Chat = (props) => {
    let d = props.data;
    let timer;
    let user = JSON.parse(Cookies.get('user'));
    let opponent = JSON.parse(Cookies.get('opponent'));
    const code = useRef(null);
    const messageBoxRef = useRef(null);
    const [turn, setTurn] = useState(d.turn);
    const [messages, setMessages] = useState(d.chat);
    const [message, setMessage] = useState("");

    const createMessageItem = (attr, content) => {
        return React.createElement('li', attr, <div className="message-item">{content}</div>);
    }

    const handleDone = (status) => {
        props.handleFinishModal(status);
    }

    const handleSettings = (e) => {
    }

    const handleChatSubmit = (e) => {
        e.preventDefault();
        setMessages([...messages, { nickname: user.nickname, roomId: user.roomId, message: message }]);
        setMessage("");
        API.SOCKET.CHAT.SEND({ nickname: user.nickname, roomId: user.roomId, message: message });
    }

    const handleTyping = (e) => {
        setMessage(e.target.value);
        e.key !== "Enter" && API.SOCKET.CHAT.TYPING(user);
    }

    const scrollMessagesToBottom = () => {
        if (messageBoxRef.current) {
            if (messageBoxRef.current.scrollHeight) {
                messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
            }
        }
    }

    useEffect(() => {
        API.SOCKET.LINK.on("chat-typing", (res) => {
            clearTimeout(timer);
            document.getElementById('typing').textContent = res;
            timer = setTimeout(() => {
                document.getElementById('typing').textContent = "";
            }, 3000);
            scrollMessagesToBottom();
        });
    }, [])

    useEffect(() => {
        let isMounted = true;
        API.SOCKET.LINK.on("chat-response", (chat, t, done) => {
            if (done) {
                isMounted && handleDone(user.nickname === JSON.parse(done).nickname ? 'WIN' : 'LOSE');
            } else {
                setTurn(t);
                setMessages(chat);
                clearTimeout(timer);
                document.getElementById('typing').textContent = "";
            }
        });
        return () => {
            isMounted = false;
            API.SOCKET.LINK.off("chat-response");
        }
    }, [])

    const copyToClipboard = (e) => {
        code.current.select();
        document.execCommand('copy');
    }

    const collapse = (e) => {
        let parent = e.currentTarget.parentNode;
        parent.classList.contains('hidden') ? parent.classList.remove('hidden') : parent.classList.add('hidden')
    }

    useEffect(scrollMessagesToBottom, [messages]);

    return props.data ? (
        <React.Fragment>
            <div className="chat-container active">
                <button className="chat-collapse" onClick={(e) => collapse(e)}>
                </button>
                <div className="user-info">
                    <div className="profile">
                        <div className={`user-nickname ${turn === user.isLight ? 'active' : ''}`}>
                            {user.nickname}
                            <div className="tag">YOU</div>
                        </div>
                        <div>VS</div>
                        <div className={`opponent-nickname ${turn === user.isLight ? '' : 'active'}`}>
                            {opponent.nickname}
                        </div>
                    </div>
                    <footer>
                        <div className="code-container">
                            <input className="code-input" ref={code} onClick={(e) => copyToClipboard(e)} value={user.roomId} readOnly />
                            <Copy />
                        </div>
                        <div className="tools">
                            <button className="reload" onClick={(e) => handleSettings(e)}><Reload /></button>
                            <button className="settings" onClick={(e) => handleSettings(e)}><Settings /></button>
                            <button className="surrender" onClick={() => handleDone('LOGOUT')}><Flag /></button>
                        </div>
                    </footer>
                </div>
                <ul className="chat-messages" id="messages" ref={messageBoxRef}>
                    {
                        messages.map((obj, i) => {
                            switch (obj.type) {
                                case "START":
                                    return createMessageItem({ key: i, className: "message-game" }, <React.Fragment><Start /> GAME START<br /> GLHF!</React.Fragment>);
                                case "CASTLE":
                                    return createMessageItem({ key: i, className: "message-game" },
                                        <React.Fragment>
                                            <Castle />
                                            {
                                                obj.user.nickname === user.nickname ?
                                                    <React.Fragment>
                                                        <span className='user-text'>You</span> castled <span className='user-text'>{obj.holdingPiece.pieceName}</span> from <span className='neutral-text'>{obj.fromPosition} to {obj.newPosition}</span> and <span className='user-text'>your rook</span> moved <span className='neutral-text'>{obj.rook.fromPosition} to {obj.rook.newPosition}</span>!
                                                    </React.Fragment> :
                                                    <React.Fragment>
                                                        <span className='opponent-text'>{obj.user.nickname}</span> castled <span className='opponent-text'>{obj.holdingPiece.pieceName}</span> from <span className='neutral-text'>{obj.fromPosition} to {obj.newPosition}</span> and <span className='opponent-text'>their rook</span> moved <span className='neutral-text'>{obj.rook.fromPosition} to {obj.rook.newPosition}</span>
                                                    </React.Fragment>
                                            }
                                        </React.Fragment>
                                    );
                                case "BATTLE":
                                    return React.createElement('li', { key: i, className: "message-game", style: { backgroundColor: "#ff4545" } },
                                        <div className="message-item">
                                            <Battle />
                                            {
                                                obj.user.nickname === user.nickname ?
                                                    <React.Fragment>
                                                        <span className='user-text'>You</span> moved <span className='user-text'>{obj.holdingPiece.pieceName}</span> from <span className='neutral-text'>{obj.fromPosition} to {obj.newPosition}</span> and toppled their <span className='opponent-text'>{obj.opponentPiece.pieceName}</span>!
                                                    </React.Fragment> :
                                                    <React.Fragment>
                                                        <span className='opponent-text'>{obj.user.nickname}</span> moved <span className='opponent-text'>{obj.holdingPiece.pieceName}</span> from <span className='neutral-text'>{obj.fromPosition} to {obj.newPosition}</span> and toppled <span className='user-text'>your {obj.opponentPiece.pieceName}</span>!
                                                    </React.Fragment>
                                            }
                                        </div>
                                    );
                                case "MOVE":
                                    return React.createElement('li', { key: i, className: "message-game" },
                                        <div className="message-item">
                                            <Move />
                                            {
                                                obj.user.nickname === user.nickname ?
                                                    <React.Fragment>
                                                        <span className='user-text'>You</span> moved <span className='user-text'>{obj.holdingPiece.pieceName}</span> from <span className='neutral-text'>{obj.fromPosition} to {obj.newPosition}</span>
                                                    </React.Fragment> :
                                                    <React.Fragment>
                                                        <span className='opponent-text'>{obj.user.nickname}</span> moved <span className='opponent-text'>{obj.holdingPiece.pieceName}</span> from <span className='neutral-text'>{obj.fromPosition} to {obj.newPosition}</span>
                                                    </React.Fragment>
                                            }
                                        </div>
                                    )
                                default:
                                    return React.createElement('li',
                                        { key: i, className: user.nickname === obj.nickname ? 'message-user' : 'message-opponent' },
                                        <div className="message-item">
                                            {obj.message}
                                        </div>
                                    );
                            }
                        })
                    }
                    <li id="typing"></li>
                </ul>
                <form className="chat-form" onSubmit={(e) => handleChatSubmit(e)}>
                    <input className="chat-input" value={message} placeholder="Enter text here" onChange={(e) => handleTyping(e)} autoComplete="off" autoFocus />
                    <button type="submit"><Send /></button>
                </form>
            </div >
        </React.Fragment>
    ) : "Loading"
}

export default Chat
