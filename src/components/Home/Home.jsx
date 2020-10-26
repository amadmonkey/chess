// app
import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie';

// components
import Chess from '../../utilities/Chess/Chess';
import Chat from '../../utilities/Chat/Chat';
import { ReactComponent as Win } from '../../img/chess-win.svg';
import { ReactComponent as Lose } from '../../img/chess-lose.svg';
import { ReactComponent as Rematch } from '../../img/chess-castling.svg';
import { ReactComponent as Exit } from '../../img/chess-move.svg';
import { ReactComponent as Caution } from '../../img/caution.svg';

// data
import API from '../../data/API.js';

// styles
import './Home.scss';

const Home = () => {
    let history = useHistory();
    let user = Cookies.get('user');
    let opponent = Cookies.get('opponent');
    const [data, setData] = useState(null);
    const [finishImage, setFinishImage] = useState(null);
    const [finishMessage, setFinishMessage] = useState(null);
    const [finishOptions, setFinishOptions] = useState(null);
    const [isFinisModalActive, setIsFinishModalActive] = useState(null);

    const handleFinishModal = (status) => {
        setModal(status);
        setIsFinishModalActive(true);
    }

    const handleLogout = () => {
        API.SOCKET.LEAVE_ROOM(JSON.parse(Cookies.get('user')));
    }

    const setModal = (status) => {
        switch (status) {
            case 'WIN':
                setFinishImage(<Win />)
                setFinishMessage({ title: 'You win!', subtitle: "You crushed the opposing army! Now scrub their blood off your castle walls." });
                setFinishOptions(
                    <React.Fragment>
                        <button onClick={() => history.push('/login')}>
                            <Exit />
                            To lobby
                        </button>
                    </React.Fragment>
                );
                setIsFinishModalActive(true);
                clearCookies();
                break;
            case 'WIN-DEFAULT':
                setIsFinishModalActive(true);
                setFinishImage(<Win />)
                setFinishMessage({ title: 'Win!', subtitle: "You won by submission! Congratulations I guess?" });
                setFinishOptions(
                    <React.Fragment>
                        <button onClick={() => history.push('/login')}>
                            <Exit />
                            To lobby
                        </button>
                    </React.Fragment>
                );
                setIsFinishModalActive(true);
                clearCookies();
                break;
            case 'LOSE':
                setIsFinishModalActive(true);
                setFinishImage(<Lose />)
                setFinishMessage({ title: 'Lose', subtitle: "Ew" });
                setFinishOptions(
                    <React.Fragment>
                        <button onClick={() => history.push('/login')}>
                            <Exit />
                            To lobby
                        </button>
                    </React.Fragment>
                );
                setIsFinishModalActive(true);
                clearCookies();
                break;
            case 'LOGOUT':
                setFinishImage(<Caution />)
                setFinishMessage({ title: 'Surrender?', subtitle: "Surrendering will turn you into a loser. Are you a f****** loser?" });
                setFinishOptions(
                    <React.Fragment>
                        <button onClick={() => setIsFinishModalActive(false)}>
                            <Exit />
                            Cancel
                        </button>
                        <button onClick={() => handleLogout()}>
                            <Lose />
                            Yes
                        </button>
                    </React.Fragment>
                );
                break;
            default:
                break;
        }
    }

    const clearCookies = () => {
        Cookies.remove('roomId');
        Cookies.remove('user');
        Cookies.remove('opponent');
    }

    useEffect(() => {
        !user && history.push('/login');
        if (user) {
            API.SOCKET.VALIDATE_SESSION({ roomId: Cookies.get('roomId'), user: Cookies.get('user') });
        }
        API.SOCKET.LINK.on("logout-response", (params) => { // logged out manually
            setModal(params.nickname === JSON.parse(user).nickname ? 'LOSE' : 'WIN-DEFAULT');
        });
        API.SOCKET.LINK.on('logout', (res) => { // for unexpected errors
            clearCookies();
            history.push('/login')
        });
    }, [])

    useEffect(() => {
        API.SOCKET.LINK.on('validate-response', (res) => {
            setData(res);
        });
        API.SOCKET.LINK.on('error', err => handleErrors(err));
        API.SOCKET.LINK.on('connect_error', err => handleErrors(err));
        API.SOCKET.LINK.on('connect_failed', err => handleErrors(err));
        API.SOCKET.LINK.on('disconnect', err => handleErrors(err));
        const handleErrors = (err) => {
            // Cookies.remove('roomId');
            // Cookies.remove('user');
            // Cookies.remove('opponent');
            // history.push('/login');
        }
    }, [data])

    return (
        <React.Fragment>
            <div className="content">
                <section className="section chess">
                    {data ? <Chess user={user} opponent={opponent} data={data} /> : "Loading"}
                </section>
                <section className="section chat">
                    {data ? <Chat user={user} opponent={opponent} data={data} handleFinishModal={handleFinishModal} /> : "Loading"}
                </section>
            </div>
            <div className={`finish-modal ${isFinisModalActive ? 'active' : ''}`}>
                <div className="modal-container">
                    <header>
                        {finishImage}
                        <h1>{finishMessage && finishMessage.title}</h1>
                        <p>{finishMessage && finishMessage.subtitle}</p>
                    </header>
                    <div className="options">{finishOptions}</div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default Home
