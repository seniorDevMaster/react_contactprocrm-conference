import React, { useEffect } from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route
} from 'react-router-dom';
import './App.css';
import Home from './views/home';
import Login from './views/login';
import Join from './views/join';
import Blank from './views/blank';
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
					{/* <Route path="/" component={Blank}></Route> */}
				</Switch>
			</Router>
		</div>
	);
}

export default App;
