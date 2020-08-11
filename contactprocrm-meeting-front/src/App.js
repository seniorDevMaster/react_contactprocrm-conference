import React, { useEffect } from 'react';
import {
	BrowserRouter as Router,
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
	useEffect(() => {
	});
	return (
		<div className="App">
			<Router>
				<Switch>
					<Route path="/room" component={Home}></Route>
					<Route path="/join" component={Join}></Route>
					<Route path="/login" component={Login}></Route>
					<Route path="/" component={Login}></Route>
					<Route path="/404" component={NotFoundPage} ></Route>
					<Redirect to="/404" ></Redirect>
                </Switch>
            </Router>
		</div>
	);
}

export default App;
