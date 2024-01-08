import React, { useEffect, useState } from 'react';
import SideBar from '../../layout/SideBar';
import { useNavigate } from 'react-router-dom';

import './style.css';

const Profile = () => {
	let navigate = useNavigate();
	const [userDetails, setuserDetails] = useState({
		name: '',
		email: '',
		gender: '',
		age: '',
	});
	const [editMode, setEditMode] = useState(false);
	const [showLogout, setShowLogout] = useState(false);

	const makeChanges = () => {
		setEditMode(true);
	};
	const saveChanges = () => {
		setEditMode(false);
	};

	useEffect(() => {
		const userdata = JSON.parse(localStorage.getItem('userDetails'));
		if (userdata?.username) {
			setuserDetails({
				name: userdata.username,
				email: userdata.email,
				gender: userdata.gender,
				age: userdata.age,
			});
		} else {
			return navigate('/signup');
		}
	}, [JSON]);

	return (
		<main>
			{showLogout ? (
				<LogoutModal setShowModal={setShowLogout} showModal={showLogout} />
			) : (
				''
			)}
			<SideBar />
			<div className="main-app">
				<h2>Profile</h2>

				<div className="tab">
					<img src="/assets/profile.jpg" />
					<div className="tab__contents">
						<form className={editMode ? '' : 'saved'}>
							<div>
								<label for="name">Name</label>
								<input
									type="text"
									name="name"
									id="name"
									value={userDetails.name}
									readOnly={!editMode}
									onChange={(e) => {
										setuserDetails({ ...userDetails, name: e.target.value });
									}}
								/>
								<label for="email">Email</label>
								<input
									type="email"
									name="email"
									id="email"
									value={userDetails.email}
									readOnly={!editMode}
									onChange={(e) => {
										setuserDetails({ ...userDetails, email: e.target.value });
									}}
								/>
							</div>
							<div>
								<label>Gender</label>
								<select
									name="gender"
									value={userDetails.gender}
									onChange={(e) => {
										setuserDetails({ ...userDetails, gender: e.target.value });
									}}
									disabled={!editMode ? 'disabled' : ''}
								>
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
									readOnly={!editMode}
									onChange={(e) => {
										setuserDetails({ ...userDetails, age: e.target.value });
									}}
								/>
							</div>
						</form>
						<div className="make_changes">
							<button className="logout" onClick={() => setShowLogout(true)}>
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Profile;

const LogoutModal = ({ setShowModal, showModal }) => {
	let navigate = useNavigate();
	const logout = () => {
		localStorage.removeItem('userDetails');
		return navigate('/signup');
	};

	return (
		<div className="modal">
			<div className="modal__content">
				<h4>Are you sure you want to Log out?</h4>
				<div>
					<button onClick={logout}>Yes</button>
					<button onClick={() => setShowModal(false)}>No</button>
				</div>
			</div>
		</div>
	);
};
