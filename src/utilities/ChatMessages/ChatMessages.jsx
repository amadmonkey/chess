import React from 'react'

const ChatMessages = (props) => {
    return (
        <ul id="messages">
            {props.messages}
            <li id="typing" style={{ display: props.typing ? "inline-block" : "none" }}>{props.typing}</li>
        </ul>
    )
}

export default ChatMessages
