// app
import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie';

// components
import Chess from '../../utilities/Chess/Chess';
import Chat from '../../utilities/Chat/Chat';
import { ReactComponent as Win } from '../../img/chess-win.svg';
import { ReactComponent as Lose } from '../../img/chess-lose.svg';
import { ReactComponent as Exit } from '../../img/chess-move.svg';
import { ReactComponent as Caution } from '../../img/caution.svg';

// data
import API from '../../data/API.js';

// styles
import './Home.scss';

const Home = () => {
    let history = useHistory();
    let notifsCount = 0, isTabOnFocus = false;
    let intervalId = null;
    let user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;
    let opponent = Cookies.get('opponent') ? JSON.parse(Cookies.get('opponent')) : null;

    const [data, setData] = useState(null);
    const [isFinishModalActive, setIsFinishModalActive] = useState(false);
    const [finishModal, setFinishModal] = useState({ image: null, message: { title: null, subtitle: null }, options: null });

    const handleFinishModal = (status) => {
        setModal(status);
        setIsFinishModalActive(true);
    }

    const handleLogout = () => {
        API.SOCKET.LEAVE_ROOM(JSON.parse(Cookies.get('user')));
    }
    
    const handleDone = (status) => {
        checkNotifs();
        handleFinishModal(status);
    }
    
    const backToLogin = () => {
        history.push('/login');
    }

    const clearCookies = () => {
        Cookies.remove('roomId');
        Cookies.remove('user');
        Cookies.remove('opponent');
    }

    const setModal = (status) => {
        switch (status) {
            case 'WIN':
                setFinishModal({
                    image: <Win />,
                    message: { title: 'You win!', subtitle: "You crushed the opposing army! Now scrub their blood off your castle walls." },
                    options:
                        <React.Fragment>
                            <button type="button" onClick={() => backToLogin()}>
                                <Exit />
                                To lobby
                            </button>
                        </React.Fragment>
                });
                setIsFinishModalActive(true);
                clearCookies();
                break;
            case 'WIN-DEFAULT':
                setFinishModal({
                    image: <Win />,
                    message: { title: 'Win!', subtitle: "You won by submission! Congratulations I guess?" },
                    options:
                        <React.Fragment>
                            <button type="button" onClick={() => backToLogin()}>
                                <Exit />
                                To lobby
                            </button>
                        </React.Fragment>
                });
                setIsFinishModalActive(true);
                clearCookies();
                break;
            case 'LOSE':
                setFinishModal({
                    image: <Lose />,
                    message: { title: 'Lose', subtitle: "Ew" },
                    options:
                        <React.Fragment>
                            <button type="button" onClick={() => backToLogin()}>
                                <Exit />
                                To lobby
                            </button>
                        </React.Fragment>
                });
                setIsFinishModalActive(true);
                clearCookies();
                break;
            case 'LOGOUT':
                setFinishModal({
                    image: <Caution />,
                    message: { title: 'Resign?', subtitle: "Resigning will turn you into a loser. Are you a f****** loser?" },
                    options:
                        <React.Fragment>
                            <button type="button" onClick={() => setIsFinishModalActive(false)}>
                                <Exit />
                                Cancel
                            </button>
                            <button type="button" onClick={() => handleLogout()}>
                                <Lose />
                                Yes
                            </button>
                        </React.Fragment>
                });
                break;
            default:
                break;
        }
        checkNotifs();
    }

    useEffect(() => {
        !user && history.push('/login');
        let isMounted = true;
        if (user) {
            API.SOCKET.VALIDATE_SESSION({ roomId: Cookies.get('roomId'), user: Cookies.get('user') });
        }
        API.SOCKET.LINK.on('logout', (res) => { // for unexpected errors
            isMounted && clearCookies();
            isMounted && history.push('/login')
        });
        return () => {
            isMounted = false;
            API.SOCKET.LINK.off('logout');
        };
    }, [])

    useEffect(() => {
        let isMounted = true;
        API.SOCKET.LINK.on("logout-response", (params) => { // logged out manually
            isMounted && setModal(params.nickname === JSON.parse(Cookies.get('user')).nickname ? 'LOSE' : 'WIN-DEFAULT');
        });
        return () => {
            isMounted = false;
            clearCookies();
        };
    }, [])

    useEffect(() => {
        let isMounted = true;
        API.SOCKET.LINK.on('validate-response', (res) => {
            if(isMounted)
                setData(res);
        });
        return () => {
            isMounted = false;
            API.SOCKET.LINK.off('validate-response');
        };
    }, [data])

    useEffect(() => {
        let isMounted = true;
        const handleErrors = (err) => {
            clearCookies();
            history.push('/login');
        }
        if (isMounted) {
            API.SOCKET.LINK.on('error', err => handleErrors(err));
            API.SOCKET.LINK.on('connect_error', err => handleErrors(err));
            API.SOCKET.LINK.on('connect_failed', err => handleErrors(err));
            API.SOCKET.LINK.on('disconnect', err => handleErrors(err));
        }
        return () => {
            API.SOCKET.LINK.off('error', err => handleErrors(err));
            API.SOCKET.LINK.off('connect_error', err => handleErrors(err));
            API.SOCKET.LINK.off('connect_failed', err => handleErrors(err));
            API.SOCKET.LINK.off('disconnect', err => handleErrors(err));
        }
    }, [])

    const checkNotifs = () => {
        if (!isTabOnFocus) {
            notifsCount = notifsCount === 9 ? 9 : notifsCount + 1;
            document.title = `(${notifsCount === 9 ? `${notifsCount}+` : notifsCount}) Play Chess?`;
            document.getElementById('favicon').href = `${process.env.PUBLIC_URL}/favicon.png`;
            setTitleInterval();
        } else {
            notifsCount = 0;
            clearInterval(intervalId);
            document.title = 'Play Chess';
            document.getElementById('favicon').href = `${process.env.PUBLIC_URL}/pawn.svg`;
        }
    }

    const setTitleInterval = () => {
        let title = "Play Chess?";
        clearInterval(intervalId);
        intervalId = setInterval(() => document.title = document.title.includes("(") ? title : `(${notifsCount === 9 ? `${notifsCount}+` : notifsCount}) ${title}`, 3000);
    }

    useEffect(() => {
        const tabOnFocus = () => {
            isTabOnFocus = true;
            checkNotifs();
        }
        const tabOnBlur = () => isTabOnFocus = false;
        window.addEventListener("focus", tabOnFocus);
        window.addEventListener("blur", tabOnBlur);
        return () => {
            window.removeEventListener("focus", tabOnFocus);
            window.removeEventListener("blur", tabOnBlur);
        }
    })

    return (
        <React.Fragment>
            <div className="content">
                {
                    data ?
                    <>
                        <section className="section chess">
                            <Chess user={user} opponent={opponent} data={data} handleDone={handleDone} />
                        </section>
                        <section className="section chat">
                            <Chat user={user} opponent={opponent} data={data} handleDone={handleDone} handleNotif={checkNotifs} />
                        </section>
                    </> : "Loading"
                }
            </div>
            <div className={`finish-modal ${isFinishModalActive ? 'active' : ''}`}>
                <div className="modal-container">
                    <header>
                        {finishModal.image}
                        <h1>{finishModal.message && finishModal.message.title}</h1>
                    </header>
                    <div className="options">{finishModal.options}</div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default Home
