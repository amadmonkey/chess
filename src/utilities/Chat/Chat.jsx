// app
import React, { useState, useEffect, useRef } from "react";
import Cookies from 'js-cookie';

// components
import { ReactComponent as Send } from '../../img/send.svg';
import { ReactComponent as Start } from '../../img/chat-start.svg';
import { ReactComponent as Move } from '../../img/chat-move.svg';
import { ReactComponent as Battle } from '../../img/chat-blades.svg';
import { ReactComponent as Castle } from '../../img/chess-castling.svg';

// data
import API from '../../data/API.js';

// styles
import "./Chat.scss";

const Chat = (props) => {
    let d = props.data, timer;
    let user = JSON.parse(Cookies.get('user'));
    const messageBoxRef = useRef(null);
    const [messages, setMessages] = useState(d.chat);
    const [message, setMessage] = useState("");

    const createMessageItem = (message, attr, content) => {
        return React.createElement('li', attr, (
            <>
                <>
                    <div className="message-item">
                        {content}
                    </div>
                </>
                <span className="time-ago">{message.timeAgo}</span>
            </>
        ))
    }

    const updateMessages = (messages) => {
        return messages.map(message => {
            message.timeAgo = timeAgo(+new Date(message.date))
            return message;
        })
    }

    const handleChatSubmit = (e) => {
        e.preventDefault();
        setMessages(updateMessages([...messages, { nickname: user.nickname, roomId: user.roomId, message: message, date: new Date() }]));
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

    const timeAgo = (date) => {
        // https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time
        const units = {
            year  : 24 * 60 * 60 * 1000 * 365,
            month : 24 * 60 * 60 * 1000 * 365/12,
            day   : 24 * 60 * 60 * 1000,
            hour  : 60 * 60 * 1000,
            minute: 60 * 1000,
            second: 1000
        }
        
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
        
        const getRelativeTime = (d1, d2 = new Date()) => {
            const elapsed = d1 - d2
            // "Math.abs" accounts for both "past" & "future" scenarios
            for (var u in units) 
                if (Math.abs(elapsed) > units[u] || u === 'second') 
                return rtf.format(Math.round(elapsed/units[u]), u)
        }

        return getRelativeTime(date);
    }

    useEffect(() => {
        let timer = null;
        API.SOCKET.LINK.on("chat-typing", (res) => {
            document.getElementById('typing').textContent = res;
            timer = setTimeout(() => {
                document.getElementById('typing').textContent = "";
            }, 3000);
            scrollMessagesToBottom();
        });
        return () => {
            clearTimeout(timer);
            API.SOCKET.LINK.off('chat-typing');
        }
    })

    useEffect(() => {
        let isMounted = true;
        API.SOCKET.LINK.on("chat-response", (chat, t, done) => {
            if (done) {
                isMounted && props.handleDone(user.nickname === JSON.parse(done).nickname ? 'WIN' : 'LOSE');
            } else {
                setMessages(updateMessages(chat));
                clearTimeout(timer);
                document.getElementById('typing').innerText = "";
            }
            props.handleNotif();
        });
        return () => {
            isMounted = false;
            API.SOCKET.LINK.off("chat-response");
        }
    }, [])

    useEffect(() => {
        let timer2;
        timer2 = setInterval(() => {
            setMessages(updateMessages(messages));
        }, 60000);
        return () => {
            clearInterval(timer2);
        }
    })

    useEffect(scrollMessagesToBottom, [messages]);

    return props.data ? (
        <React.Fragment>
            <div className="chat-container">
                <ul className="chat-messages" id="messages" ref={messageBoxRef}>
                    {
                        messages.map((m, i) => {
                            switch (m.type) {
                                case "START":
                                    return createMessageItem(m, { key: i, className: "message-game" }, <React.Fragment><Start />GAME START</React.Fragment>);
                                case "CASTLE":
                                    return createMessageItem(m, { key: i, className: "message-game" },
                                        <React.Fragment>
                                            <Castle />
                                            {
                                                m.user.nickname === user.nickname ?
                                                    <React.Fragment>
                                                        <span className='user-text'>You</span> castled <span className='user-text'>{m.holdingPiece.pieceName}</span> from <span className='neutral-text'>{m.fromPosition} to {m.newPosition}</span> and <span className='user-text'>your rook</span> moved <span className='neutral-text'>{m.rook.fromPosition} to {m.rook.newPosition}</span>!
                                                    </React.Fragment> :
                                                    <React.Fragment>
                                                        <span className='opponent-text'>{m.user.nickname}</span> castled <span className='opponent-text'>{m.holdingPiece.pieceName}</span> from <span className='neutral-text'>{m.fromPosition} to {m.newPosition}</span> and <span className='opponent-text'>their rook</span> moved <span className='neutral-text'>{m.rook.fromPosition} to {m.rook.position}</span>
                                                    </React.Fragment>
                                            }
                                        </React.Fragment>
                                    );
                                case "BATTLE":
                                    return createMessageItem(m, { key: i, className: "message-game" },
                                        <div className="message-item">
                                            <Battle />
                                            {
                                                m.user.nickname === user.nickname ?
                                                    <React.Fragment>
                                                        <span className='user-text'>You</span> moved <span className='user-text'>{m.holdingPiece.pieceName}</span> from <span className='neutral-text'>{m.fromPosition} to {m.newPosition}</span> and captured their <span className='opponent-text'>{m.opponentPiece.pieceName}</span>!
                                                    </React.Fragment> :
                                                    <React.Fragment>
                                                        <span className='opponent-text'>{m.user.nickname}</span> moved <span className='opponent-text'>{m.holdingPiece.pieceName}</span> from <span className='neutral-text'>{m.fromPosition} to {m.newPosition}</span> and captured <span className='user-text'>your {m.opponentPiece.pieceName}</span>!
                                                    </React.Fragment>
                                            }
                                        </div>
                                    );
                                case "MOVE":
                                    return createMessageItem(m, { key: i, className: "message-game" },
                                        <div className="message-item">
                                            <Move />
                                            {
                                                m.user.nickname === user.nickname ?
                                                    <React.Fragment>
                                                        <span className='user-text'>You</span> moved <span className='user-text'>{m.holdingPiece.pieceName}</span> from <span className='neutral-text'>{m.fromPosition} to {m.newPosition}</span>
                                                    </React.Fragment> :
                                                    <React.Fragment>
                                                        <span className='opponent-text'>{m.user.nickname}</span> moved <span className='opponent-text'>{m.holdingPiece.pieceName}</span> from <span className='neutral-text'>{m.fromPosition} to {m.newPosition}</span>
                                                    </React.Fragment>
                                            }
                                        </div>
                                    )
                                default:
                                    return createMessageItem(m, { key: i, className: user.nickname === m.nickname ? 'message-user' : 'message-opponent' },
                                        <>
                                            {m.message}
                                        </>
                                    );
                            }
                        })
                    }
                    <li id="typing"></li>
                </ul>
                <form className="chat-form" onSubmit={(e) => handleChatSubmit(e)}>
                    <input className="chat-input" value={message} maxLength="50" placeholder="Enter text here" onChange={(e) => handleTyping(e)} autoComplete="off" autoFocus />
                    <button type="submit"><Send /></button>
                </form>
            </div >
        </React.Fragment>
    ) : "Loading"
}

export default Chat
