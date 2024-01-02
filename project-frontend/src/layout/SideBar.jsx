import React from 'react';
import './layout.css';
import { Link } from 'react-router-dom';
const SideBar = ({ auth }) => {
	return (
		<div className="sidebar">
			<div className="img-container">
				<img src="/assets/logo.svg" />
			</div>
			<nav>
				{auth ? (
					<ul>
						<li>
							<Link to={'/signup'}>Signup</Link>
						</li>
						<li>
							<Link to={'/login'}>Login</Link>
						</li>
					</ul>
				) : (
					<ul>
						<li>
							<Link to={'/profile'}>Profile</Link>
						</li>
						<li>
							<Link to={'/'}>Chat History</Link>
						</li>
					</ul>
				)}
			</nav>
		</div>
	);
};

export default SideBar;
