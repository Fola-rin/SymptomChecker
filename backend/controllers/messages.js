import OpenAI from 'openai';
import { pool } from '../db.js';
import axios from 'axios';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const encrypt = (text) => {
	const iv = crypto.randomBytes(16); // Initialization vector
	const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
	const textParts = text.split(':');
	const iv = Buffer.from(textParts.shift(), 'hex');
	const encryptedText = Buffer.from(textParts.join(':'), 'hex');
	const decipher = crypto.createDecipheriv(
		algorithm,
		Buffer.from(secretKey),
		iv
	);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;
const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

const INITIALSYSTEM = `
You are a symptom checker application, whose primary objective is to engage users in conversation and assist them in identifying their symptoms and potential health concerns. 
Your responses should be clear, informative, and aid users in understanding their health concerns.
At the end of the conversation, give a report of possible diagnoses.

Format: All responses should be in JSON format.
The JSON object should be formatted as follows: 
i. A key of "message" containing the message and, 
ii. a key of "diagnosis" containing an array of possible diagnoses. 
Each object within the diagnoses array should have the following keys: A key of "disease_name" that represents the name of the disease, and a key of "course_of_action" that represents the recommended.

Note that the diagnosis comes after you have asked all relevant questions.
`;

const handleDiagnosis = async (data) => {
	const diagnosesArray = JSON.parse(data.content).diagnosis;
	const diagnoses = [];
	if (diagnosesArray) {
		const promises = diagnosesArray.map((item) => {
			return axios({
				method: 'get',
				url: `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q='${item.disease_name}'`,
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then((response) => {
					const data = response.data;
					const searchResult = data.items ? data.items[0] : null;
					const diagObj = {
						disease_name: item.disease_name,
						course_of_action: item.course_of_action,
						searchResult: searchResult.link,
					};
					diagnoses.push(diagObj);
				})
				.catch((error) => {
					console.log(error);
				});
		});

		await Promise.all(promises);
	}

	return diagnoses;
};
export const createMessage = async (req, res) => {
	try {
		const { chats, chatID, userInfo, system } = req.body;
		let COTSYSTEM = `
You are a symptom checker application. 
Utilize the below information as you interface with the user
User name: ${userInfo.name}
User age: 35
User gender: male

Follow these steps in your conversation with the user:

Step 1: Greet the user by using their name and ask them to describe their main symptoms in their own words.

Step 2: After understanding the main symptoms, ask for specific details like when the symptoms started and their severity. 

Step 3: Next,  ask if there has been any change in the symptoms over time, including any factors that make them better or worse. 

Step 4: Based on the information gathered, provide an initial assessment and list of possible diagnoses.  

Format: All responses should be in JSON format.
The JSON object should be formatted as follows: 
i. A key of "message" containing the message and, 
ii. a key of "diagnosis" containing an array of possible diagnoses. 
Each object within the diagnoses array should have the following keys: A key of "disease_name" that represents the name of the disease, and a key of "course_of_action" that represents the recommended.

Note that the diagnosis comes after you have asked all relevant questions.
`;

		const message = [
			{
				role: 'system',
				content: system === 'first' ? INITIALSYSTEM : COTSYSTEM,
			},
		];
		const result = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo-1106',
			messages: [...message, ...chats],
			temperature: 0.2,
			response_format: { type: 'json_object' },
		});
		const response = result.choices[0].message;

		const updateQuery = `
		    UPDATE chats SET chat_name = $1, diagnosis = $2
		    WHERE chat_id = $3
		`;
		const insertQuery = `
		    INSERT INTO messages (message_type, content, chat_id)
		    VALUES ($1, $2, $3)
		`;
		const diagnosis = await handleDiagnosis(response);

		try {
			const encryptedUserMessage = encrypt(chats[chats.length - 1].content);
			const encryptedResponseMessage = encrypt(response.content);
			await pool.query(insertQuery, [
				chats[chats.length - 1].role,
				encryptedUserMessage,
				chatID,
			]);
			await pool.query(insertQuery, [
				response.role,
				encryptedResponseMessage,
				chatID,
			]);
		} catch (error) {
			console.log('Encryption Key Length:', secretKey.length);
			console.error('Error inserting into messages table:', error);
		}
		if (diagnosis.length) {
			console.log('hello', diagnosis);
			try {
				await pool.query(updateQuery, [
					diagnosis[0].disease_name,
					JSON.stringify(diagnosis),
					chatID,
				]);
				res
					.status(201)
					.json({ response, diagnosis: JSON.stringify(diagnosis) });
			} catch (error) {
				console.error('An error occured', error);
			}
		} else {
			res.status(201).json({ response });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const getMessages = async (req, res) => {
	try {
		const chat_id = parseInt(req.params.chat_id);
		const selectQuery = `
            SELECT * FROM messages WHERE chat_id = $1
        `;
		let response = {};
		try {
			response = await pool.query(selectQuery, [chat_id]);
			response.rows.forEach((row) => {
				row.content = decrypt(row.content);
				// console.log('Decrypted Message:', content);
			});
			res.status(200).json({ response: response.rows });
		} catch (error) {
			console.error('Error fetching chats:', error);
			res.status(500).json({ success: false, message: error.message });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
