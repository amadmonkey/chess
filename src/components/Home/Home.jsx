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

    return userDetails ? (
        <div className="content">
            <section className="section chess">
                <Chess userDetails={userDetails} />
            </section>
            <section className="section chat">
                {/* <Chess userDetails={userDetails} /> */}
            </section>
        </div>
    ) : "Loading"
}

export default Home
