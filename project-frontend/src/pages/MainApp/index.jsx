import SideBar from '../../layout/SideBar';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import '../../App.css';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.PROD
	? import.meta.env.VITE_API_PROD_URL
	: import.meta.env.VITE_API_URL;

console.log(import.meta.env.MODE);

// const PROMPT1 = 'Ensure that the responses are formatted in JSON'

let userPrompt = ``;

const MainApp = () => {
	let navigate = useNavigate();
	const [message, setMessage] = useState('');
	const [chats, setChats] = useState([]);
	const [chatID, setChatID] = useState(null);
	const [isTyping, setIsTyping] = useState(false);
	const [diagnosis, setDiagnosis] = useState([]);
	const [chatsState, setChatsState] = useState({ loading: true, data: [] });
	const messagesDiv = useRef(null);
	const [userDetails, setuserDetails] = useState({});

	useEffect(() => {
		const userdata = JSON.parse(localStorage.getItem('userDetails'));
		if (userdata) {
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

	const chat = async (e, message) => {
		e.preventDefault();
		if (!message) return;
		if (diagnosis.length) return;
		setIsTyping(true);
		console.log(chats);
		let msgs = chats;
		msgs.push({
			role: 'user',
			content: userPrompt + '\n"""' + message + '"""',
		});
		setChats(msgs);
		setMessage('');

		const data = JSON.stringify({
			chats,
			chatID,
			userInfo: {
				name: userDetails.name,
				age: userDetails.age,
				gender: userDetails.gender,
			},
		});
		axios({
			method: 'post',
			url: `${apiUrl}messages`,
			headers: {
				'Content-Type': 'application/json',
			},
			data,
		})
			.then((response) => {
				const data = response.data.response;

				console.log(response);
				if (data.role === 'assistant') {
					data.content = data.content.replace(/\,(?!\s*[\{\"\w])/g, '');
				}
				if (response.data?.diagnosis) {
					const diagnonsisArray = JSON.parse(response.data.diagnosis);
					setDiagnosis(diagnonsisArray);
				}
				msgs.push(data);
				setChats(msgs);
				setIsTyping(false);
			})
			.catch((error) => {
				console.log(error);
			});
	};
	const getChats = () => {
		const sender_email = userDetails?.email;

		axios({
			method: 'get',
			url: `${apiUrl}chats/${sender_email}`,
		})
			.then((response) => {
				console.log(response.data.response);
				setChatsState({ loading: false, data: response.data.response });
			})
			.catch((error) => console.log(error));
	};

	const loadConversation = (chat_id, diagnoses) => {
		setChatID(chat_id);
		axios({
			method: 'get',
			url: `${apiUrl}messages/${chat_id}`,
		}).then((response) => {
			console.log(response.data);
			const chatsData = response.data.response.map((item) => {
				return { content: item.content, role: item.message_type };
			});
			setChats(chatsData);
			if (diagnoses) {
				setDiagnosis(JSON.parse(diagnoses));
			}
		});
	};
	const createConversation = () => {
		setChats([]);
		const data = JSON.stringify({
			sender_email: userDetails?.email,
		});
		axios({
			method: 'post',
			url: `${apiUrl}chats`,
			headers: {
				'Content-Type': 'application/json',
			},
			data,
		})
			.then((response) => {
				console.log(response.data.response);
				setChatID(response.data.response[0].chat_id);
			})
			.catch((error) => console.log(error));
	};
	useEffect(() => {
		if (userDetails.email) {
			getChats();
		}
	}, [userDetails]);
	return (
		<main>
			<SideBar />
			<div className="main-app">
				{chatID ? (
					<>
						<button
							onClick={() => {
								setChatID(null);
								setDiagnosis([]);
								getChats();
							}}
							className="back-btn"
						>
							Back
						</button>
						<div>
							<section className="chat-section">
								<div className="chat" ref={messagesDiv}>
									{chats && chats.length
										? chats.map((chat, index) => (
												<div
													key={index}
													className={
														chat.role === 'user' ? 'user_msg' : 'bot_msg'
													}
												>
													{chat.role === 'user' ? (
														<span>{chat.content.split('"""')[1]}</span>
													) : (
														<span>{JSON.parse(chat.content).message}</span>
													)}
												</div>
										  ))
										: ''}
									{isTyping && chats && chats.length ? (
										<p className="bot_msg">
											<i>Bot is typing...</i>
										</p>
									) : (
										''
									)}
									{diagnosis.length ? (
										<div className="bot_msg">
											<h2>Possible conditions</h2>
											{diagnosis.map((item, index) => (
												<div key={index}>
													<h3>
														{index + 1}. {item.disease_name}
													</h3>
													<p>Recommend action: {item.course_of_action}</p>
													<a href={item.searchResult} target="_blank">
														Read more
													</a>
												</div>
											))}
										</div>
									) : (
										''
									)}
								</div>
								{diagnosis.length ? (
									''
								) : (
									<form action="" onSubmit={(e) => chat(e, message)}>
										<input
											type="text"
											name="message"
											value={message}
											placeholder="Type your message"
											onChange={(e) => setMessage(e.target.value)}
										/>
										<button onClick={(e) => chat(e, message)}>
											<span className="material-symbols-outlined">send</span>
										</button>
									</form>
								)}
							</section>
						</div>
					</>
				) : (
					<section className="convo-div">
						<div className="intro">
							<h2>Welcome {userDetails.name?.split(' ')[0]},</h2>
							<button onClick={() => createConversation()}>
								<span className="icon">
									<img src="/assets/plus.svg" />
								</span>{' '}
								<span className="text">Create new Conversation</span>
							</button>
						</div>
						<div className="actions">
							<div className="history">
								<h3>Uncompleted Diagnosis</h3>
								{chatsState.loading ? (
									<p>
										<i>Loading...</i>
									</p>
								) : chatsState.data.length &&
								  chatsState.data.filter((item) => item.diagnosis === null) ? (
									chatsState.data.map((item, index) =>
										item.diagnosis === null ? (
											<button
												key={index}
												onClick={() => loadConversation(item.chat_id)}
											>
												{item.chat_name}
											</button>
										) : (
											''
										)
									)
								) : (
									<p>No data found</p>
								)}
							</div>
							<div className="history">
								<h3>Diagnosis history</h3>
								{chatsState.loading ? (
									<p>
										<i>Loading...</i>
									</p>
								) : chatsState.data &&
								  chatsState.data.filter((item) => item.diagnosis != null)
										.length ? (
									chatsState.data.map((item, index) =>
										item.diagnosis === null ? (
											''
										) : (
											<button
												key={index}
												onClick={() =>
													loadConversation(item.chat_id, item.diagnosis)
												}
											>
												{item.chat_name}
											</button>
										)
									)
								) : (
									<p>No data found</p>
								)}
							</div>
						</div>
					</section>
				)}
			</div>
		</main>
	);
};

export default MainApp;
