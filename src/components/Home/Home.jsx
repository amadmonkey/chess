// app
import React, { useEffect } from 'react';
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
    let userDetails = null, opponentDetails = null, turn = null, set_user = null, set_opponent = null, ultiSet = null;

    if (Cookies.get('opponent')) {
        userDetails = JSON.parse(Cookies.get('user'));
        opponentDetails = JSON.parse(Cookies.get('opponent'));
        turn = JSON.parse(Cookies.get('turn'));
        set_user = JSON.parse(Cookies.get('set_user'));
        set_opponent = JSON.parse(Cookies.get('set_opponent'));
    } else {
        history.push('/login')
    }
    ultiSet = { userDetails: userDetails, opponentDetails: opponentDetails, turn: turn, user: set_user, opponent: set_opponent };

    useEffect(() => {
        API.SOCKET.VALIDATE_SESSION(userDetails);
        API.SOCKET.LINK.on('logout', (res) => {
            Cookies.remove('user');
            Cookies.remove('opponent');
            Cookies.remove('turn')
            Cookies.remove('set_user');
            Cookies.remove('set_opponent');
            history.push('/login')
        });
    }, [])

    return (
        <div className="content">
            <section className="section chess">
                {userDetails && <Chess data={ultiSet} />}
            </section>
            <section className="section chat">
                {userDetails && <Chat data={ultiSet} />}
            </section>
        </div>
    )
}

export default Home
