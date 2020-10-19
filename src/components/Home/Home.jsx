// app
import React, { useState, useEffect } from 'react';

// components
import Chess from '../../utilities/Chess/Chess';

// styles
import './Home.scss';

const Home = () => {

    const [userDetails, setUserDetails] = useState(null);

    // call db
    useEffect(() => {
        setUserDetails({
            isLight: false
        });
    }, [])

    return (
        <div className="content">
            <div className="chess-section">
                {userDetails ? <Chess userDetails={userDetails} /> : "Loading board"}
            </div>
        </div>
    )
}

export default Home
