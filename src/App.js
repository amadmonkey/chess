// app
import React from 'react';
import {BrowserRouter as Router, HashRouter, Route, Switch} from 'react-router-dom';

// components
import _ROUTES from "./data/ROUTES";
import NotFound from "./components/NotFound/NotFound";

// styles
import './reset.css';
import './App.scss';

function App() {

	return (
		<div className="App">
			<HashRouter basename="/chess">
				<Switch>
					{Object.keys(_ROUTES).map((key, i) => {
						return <Route key={i} path={_ROUTES[key].path} component={_ROUTES[key].component} exact={_ROUTES[key].exact} />
					})}
					<Route component={NotFound} exact />
				</Switch>
			</HashRouter>
		</div>
	);
}

export default App;
