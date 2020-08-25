import React, { useEffect } from 'react';
import {
	BrowserRouter as Router,
	HashRouter,
	Switch,
	Route,
	Redirect
} from 'react-router-dom';
import './App.css';
import Home from './views/home';
import Login from './views/login';
import Join from './views/join';
import NotFoundPage from './views/NotFoundPage';

function App() {
	return (
		<div className="App">
			<HashRouter>
				<Switch>
					<Route exact path="/room" component={Home}></Route>
					<Route exact path="/join" component={Join}></Route>
					<Route exact path="/login" component={Login}></Route>
					<Route exact path="/404" component={NotFoundPage} ></Route>
					<Redirect to="/404" ></Redirect>
                </Switch>
            </HashRouter>
		</div>
	);
}

export default App;
