import { pool } from '../db.js';

export const getChats = async (req, res) => {
	try {
		const sender_email = req.params.sender_email;

		const selectQuery = `
            SELECT * FROM chats
            WHERE sender_email = $1
        `;
		let response = {};
		try {
			response = await pool.query(selectQuery, [sender_email]);
			res.status(200).json({ response: response.rows });
		} catch (error) {
			console.error('Error fetching chats:', error);
			res.status(500).json({ success: false, message: error.message });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const createChat = async (req, res) => {
	try {
		const { sender_email, system } = req.body;

		const selectQuery = `
            INSERT INTO chats (sender_email, system) 
            VALUES ($1, $2)
            RETURNING chat_id, system;
        `;
		let response = {};
		try {
			response = await pool.query(selectQuery, [sender_email, system]);
			res.status(201).json({ response: response.rows });
		} catch (error) {
			console.error('Error fetching chats:', error);
			res.status(500).json({ success: false, message: error.message });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
