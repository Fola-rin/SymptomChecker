import React, { useState } from 'react';
import './layout.css';
import { Link } from 'react-router-dom';
const SideBar = ({ auth }) => {
	const [toggleSideBar, settoggleSideBar] = useState(true);
	return (
		<div className={`sidebar${toggleSideBar ? '' : ' hide'}`}>
			<div className="img-container">
				<button
					className="mobile-menu"
					onClick={() => settoggleSideBar(!toggleSideBar)}
				>
					<span className="material-symbols-outlined">menu</span>
				</button>
				<img src="/assets/logo.svg" />
			</div>
			<nav>
				{auth ? (
					<ul>
						<li onClick={() => settoggleSideBar(false)}>
							<Link to={'/signup'}>Signup</Link>
						</li>
						<li onClick={() => settoggleSideBar(false)}>
							<Link to={'/login'}>Login</Link>
						</li>
					</ul>
				) : (
					<ul>
						<li onClick={() => settoggleSideBar(false)}>
							<Link to={'/profile'}>Profile</Link>
						</li>
						<li onClick={() => settoggleSideBar(false)}>
							<Link to={'/'}>Chat History</Link>
						</li>
					</ul>
				)}
			</nav>
		</div>
	);
};

export default SideBar;
