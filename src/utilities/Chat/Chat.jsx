// app
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie';

// components
import ChatMessages from '../ChatMessages/ChatMessages';
import { ReactComponent as Send } from '../../img/send.svg';
import { ReactComponent as Settings } from '../../img/settings.svg';
import { ReactComponent as Flag } from '../../img/flag.svg';
import { ReactComponent as Error } from '../../img/error.svg';
import { ReactComponent as Copy } from '../../img/copy.svg';

// data
import API from '../../data/API.js';

// styles
import "./Chat.scss";

const Chat = (props) => {
    let userDetails = props.data.userDetails;
    let opponentDetails = props.data.opponentDetails;
    let turn = props.data.turn;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const messageBoxRef = useRef(null);
    const code = useRef(null);
    let timer;
    let history = useHistory();
    console.log('chat called');

    const createMessageItem = (attr, message) => {
        return React.createElement('li', attr, <div className="message-item">{message}</div>);
    }

    const handleLogout = (e) => {
        API.SOCKET.LOGOUT(userDetails);
    }

    const handleSurrender = (e) => {
        console.info('clicked', 'surrender');
    }

    const handleSettings = (e) => {
        console.info('clicked', 'settings');
    }

    const handleChatSubmit = (e) => {
        e.preventDefault();
        setMessages([...messages, createMessageItem({ key: (messages.length + 1), className: "message-user" }, message)]);
        setMessage("");
        API.SOCKET.CHAT.SEND({ message: message, nickname: props.data.userDetails.nickname });
    }

    const handleTyping = (e) => {
        setMessage(e.target.value);
        e.key !== "Enter" && API.SOCKET.CHAT.TYPING(userDetails);
    }

    const scrollMessagesToBottom = () => {
        if (messageBoxRef.current) {
            if (messageBoxRef.current.scrollHeight) {
                messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
            }
        }
    }

    useEffect(() => {
        API.SOCKET.LINK.on("logout-response", (res) => {
            Cookies.remove('user');
            Cookies.remove('opponent');
            Cookies.remove('turn');
            Cookies.remove('set_user');
            Cookies.remove('set_opponent');
            history.push({
                pathname: '/login',
                state: { status: 'canceled' }
            });
        });
        API.SOCKET.LINK.on("chat-list", (res) => {
            let newMessages = [];
            res.forEach((obj, i) => {
                newMessages.push(createMessageItem({ key: i, className: `message-${!obj.type ? (userDetails.nickname === obj.nickname ? 'user' : 'opponent') : obj.type}` }, obj.message));
            })
            setMessages(newMessages);
        });
        API.SOCKET.LINK.on("chat-response", (res, chat) => {
            let newMessages = [];
            chat.forEach((obj, i) => {
                newMessages.push(createMessageItem({ key: i, className: `message-${!obj.type ? (userDetails.nickname === obj.nickname ? 'user' : 'opponent') : obj.type}` }, obj.message));
            })
            setMessages(newMessages);
            clearTimeout(timer);
            document.getElementById('typing').textContent = "";
        });
        API.SOCKET.LINK.on("chat-typing", (res) => {
            console.log('type');
            clearTimeout(timer);
            document.getElementById('typing').textContent = res;
            timer = setTimeout(() => {
                document.getElementById('typing').textContent = "";
            }, 3000);
            scrollMessagesToBottom();
        });
    }, [])

    const copyToClipboard = (e) => {
        code.current.select();
        document.execCommand('copy');
        console.log('Copied to clipboard');
    }

    useEffect(scrollMessagesToBottom, [messages]);

    return props.data ? (
        <div className="chat-container">
            <div className="user-info">
                <div className="profile">
                    <div className="user-nickname">
                        {userDetails.nickname}
                        <div className="tag">YOU</div>
                    </div>
                    <div>VS</div>
                    <div className="opponent-nickname">
                        {opponentDetails.nickname}
                    </div>
                </div>
                <div className="code-container">
                    <input className="code-input" ref={code} onClick={(e) => copyToClipboard(e)} value={userDetails.roomId} readOnly />
                    <Copy />
                </div>
                <div className="tools">
                    <button className="settings" onClick={(e) => handleSettings(e)}><Settings /></button>
                    <button className="surrender" onClick={(e) => handleSurrender(e)}><Flag /></button>
                    <button className="logout" onClick={(e) => handleLogout(e)}><Error /></button>
                </div>
            </div>
            <ul className="chat-messages" id="messages" ref={messageBoxRef}>
                {messages}
                <li id="typing"></li>
            </ul>
            <form className="chat-form" onSubmit={(e) => handleChatSubmit(e)}>
                <input className="chat-input" value={message} placeholder="Enter text here" onChange={(e) => handleTyping(e)} autoComplete="off" autoFocus />
                <button type="submit"><Send /></button>
            </form>
        </div >
    ) : "Loading"
}

export default Chat
