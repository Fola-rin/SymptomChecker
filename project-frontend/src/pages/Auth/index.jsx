import React, { useEffect, useState } from 'react';
import SideBar from '../../layout/SideBar';
import axios from 'axios';
import { redirect, useNavigate } from 'react-router-dom';

import './style.css';

const Auth = () => {
	const apiUrl = import.meta.env.PROD
		? import.meta.env.VITE_API_PROD_URL
		: import.meta.env.VITE_API_URL;

	let navigate = useNavigate();
	const [userDetails, setuserDetails] = useState({
		username: '',
		email: '',
		gender: '',
		age: '',
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
		if (
			userDetails.username &&
			userDetails.age &&
			userDetails.email &&
			userDetails.gender &&
			userDetails.password
		) {
			console.log(userDetails);
			const data = JSON.stringify({ userDetails });

			axios({
				method: 'post',
				url: `${apiUrl}users`,
				headers: {
					'Content-Type': 'application/json',
				},
				data,
			})
				.then((response) => {
					setLoading(false);
					console.log(response);
					delete userDetails.password;
					localStorage.setItem('userDetails', JSON.stringify(userDetails));
					setSuccess(true);
					setuserDetails({
						username: '',
						email: '',
						gender: '',
						age: '',
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
				<h2>Signup</h2>

				<div className="tab">
					<div className="tab__contents">
						<form onSubmit={(e) => saveChanges(e)}>
							<div>
								<label>Name</label>
								<input
									type="text"
									name="name"
									value={userDetails.username}
									readOnly={loading}
									onChange={(e) => {
										setuserDetails({
											...userDetails,
											username: e.target.value,
										});
									}}
									required
								/>
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
								<label>Gender</label>
								<select
									name="gender"
									value={userDetails.gender}
									onChange={(e) => {
										setuserDetails({ ...userDetails, gender: e.target.value });
									}}
									disabled={loading ? 'disabled' : ''}
									required
								>
									<option value=""></option>
									<option value="male">Male</option>
									<option value="female">Female</option>
									<option value="none">Other</option>
								</select>
								<label>Age</label>
								<input
									type="number"
									value={userDetails.age}
									min="1"
									max="150"
									name="age"
									readOnly={loading}
									onChange={(e) => {
										setuserDetails({ ...userDetails, age: e.target.value });
									}}
									required
								/>
								{loading ? (
									<p>Loading...</p>
								) : (
									<div className="make_changes">
										<button>Sign Up</button>
									</div>
								)}
								{error ? <p style={{ color: 'red' }}>{error}</p> : ''}
								{success ? (
									<p style={{ color: 'blue' }}>Account created successfully</p>
								) : (
									''
								)}
							</div>
						</form>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Auth;
