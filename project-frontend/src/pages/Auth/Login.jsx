import React, { useEffect, useState } from 'react';
import SideBar from '../../layout/SideBar';
import axios from 'axios';
import { redirect, useNavigate } from 'react-router-dom';

import './style.css';

const Login = () => {
	let navigate = useNavigate();
	const [userDetails, setuserDetails] = useState({
		email: '',
		password: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);

	const saveChanges = (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess(false);
		if (userDetails.email && userDetails.password) {
			console.log(userDetails);
			const data = JSON.stringify({ userDetails });

			axios({
				method: 'post',
				url: 'http://localhost:3000/api/users/login',
				headers: {
					'Content-Type': 'application/json',
				},
				data,
			})
				.then((response) => {
					setLoading(false);
					console.log(response);
					localStorage.setItem(
						'userDetails',
						JSON.stringify(response.data.user)
					);
					setSuccess(true);
					setuserDetails({
						email: '',
						password: '',
					});
					return navigate('/');
				})
				.catch((error) => {
					setLoading(false);
					console.log(error);
					setError(
						error?.response?.data?.messaage
							? error?.response?.data?.messaage
							: 'An error occured'
					);
				});
		}
	};
	useEffect(() => {
		const userdata = JSON.parse(localStorage.getItem('userDetails'));
		if (userdata) {
			return navigate('/');
		}
	}, [JSON]);
	return (
		<main>
			<SideBar auth />
			<div className="main-app">
				<h2>Login</h2>

				<div className="tab">
					<div className="tab__contents">
						<form onSubmit={(e) => saveChanges(e)}>
							<div>
								<label>Email</label>
								<input
									type="email"
									name="email"
									value={userDetails.email}
									readOnly={loading}
									onChange={(e) => {
										setuserDetails({ ...userDetails, email: e.target.value });
									}}
									required
								/>
								<label>Password</label>
								<input
									type="password"
									name="password"
									value={userDetails.password}
									readOnly={loading}
									onChange={(e) => {
										setuserDetails({
											...userDetails,
											password: e.target.value,
										});
									}}
									required
								/>
								{loading ? (
									<p>Loading...</p>
								) : (
									<div className="make_changes">
										<button>Login</button>
									</div>
								)}
								{error ? <p style={{ color: 'red' }}>{error}</p> : ''}
								{success ? <p style={{ color: 'blue' }}>Login</p> : ''}
							</div>
						</form>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Login;
