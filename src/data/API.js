import SocketClient from "socket.io-client";


const base_local = "http://localhost:8080/";
// const base_svr = "https://portfolio-game-catalog.herokuapp.com";

const socket = SocketClient(base_local);

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const login = () => {

}

const logout = (params) => {
    socket.emit('logout-request', params);
}

const cancelRoom = (params) => {
    socket.emit('cancel-room', params);
}

const createRoom = (params) => {
    params.isLight = Math.round(Math.random()) === 1;
    params.roomId = generateId(4);
    socket.emit('create-room-request', params);
}

const joinRoom = (params) => {
    socket.emit('join-room-request', params);
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
        LOGIN: login,
        LOGOUT: logout,
        CANCEL_ROOM: cancelRoom,
        CREATE_ROOM: createRoom,
        JOIN_ROOM: joinRoom,
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