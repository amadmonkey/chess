import SocketClient from "socket.io-client";


const base_local = "http://localhost:8080/";
// const base_svr = "https://portfolio-game-catalog.herokuapp.com";

const socket = SocketClient(base_local);

const createRoom = (params) => {
    socket.emit('create-room-request', params);
}

const joinRoom = (params) => {
    socket.emit('join-room-request', params);
}

const leaveRoom = (params) => {
    socket.emit('leave-room', params);
}

const chat = (params) => {
    socket.emit('chat-request', params);
}

const typing = (params) => {
    socket.emit('chat-typing', params);
}

const move = (params) => {
    socket.emit('chess-move-request', params);
}

const validateSession = (params) => {
    socket.emit('validate-session', params);
}

const API = {
    SOCKET: {
        CREATE_ROOM: createRoom,
        JOIN_ROOM: joinRoom,
        LEAVE_ROOM: leaveRoom,
        VALIDATE_SESSION: validateSession,
        CHAT: {
            SEND: chat,
            TYPING: typing
        },
        CHESS: {
            MOVE: move
        },
        LINK: socket
    }
}

export default API;