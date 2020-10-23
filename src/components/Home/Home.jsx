// app
import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie';

// components
import Chess from '../../utilities/Chess/Chess';
import Chat from '../../utilities/Chat/Chat';

// data
import API from '../../data/API.js';

// styles
import './Home.scss';

const Home = () => {
    let history = useHistory();
    let user = Cookies.get('user');
    let opponent = Cookies.get('opponent');
    const [data, setData] = useState(null);
    // userDetails = JSON.parse(Cookies.get('user'));
    // opponentDetails = JSON.parse(Cookies.get('opponent'));
    // turn = JSON.parse(Cookies.get('turn'));
    // ultiSet = { userDetails: userDetails, opponentDetails: opponentDetails, turn: turn, user: set_user, opponent: set_opponent };

    useEffect(() => {
        !user && history.push('/login');
        if (user) {
            API.SOCKET.VALIDATE_SESSION({ roomId: Cookies.get('roomId'), user: Cookies.get('user') });
        }
        API.SOCKET.LINK.on('logout', (res) => {
            Cookies.remove('roomId')
            Cookies.remove('user');
            Cookies.remove('opponent');
            history.push('/login')
        });
    }, [])

    useEffect(() => {
        API.SOCKET.LINK.on('validate-response', (res) => {
            console.log(res);
            setData(res);
        });
    }, [data])

    return (
        <div className="content">
            <section className="section chess">
                {data ? <Chess user={user} opponent={opponent} data={data} /> : "Loading"}
            </section>
            <section className="section chat">
                {/* {userDetails && <Chat data={urlParams} />} */}
            </section>
        </div>
    )
}

export default Home
