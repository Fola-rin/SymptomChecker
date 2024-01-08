import { pool } from '../db.js';
import bcrypt from 'bcrypt';

const checkUser = async (email) => {
	try {
		const result = await pool.query(
			'SELECT COUNT(*) FROM users WHERE email = $1',
			[email]
		);
		return result.rows[0].count > 0;
	} catch (error) {
		console.error('Error checking email existence:', error);
		return false;
	}
};

export const UserLogin = async (req, res) => {
	const { userDetails } = req.body;
	const exists = await checkUser(userDetails.email);
	if (exists) {
		try {
			const selectQuery = `
        SELECT email, password_hash, username, age, gender FROM users
		WHERE email = $1
        `;
			let response = {};
			try {
				response = await pool.query(selectQuery, [userDetails.email]);
				if (
					await bcrypt.compare(
						userDetails.password,
						response.rows[0].password_hash
					)
				) {
					delete response.rows[0].password_hash;
					res.status(201).json({ user: response.rows[0] }); // Send user details except password_hash
				} else {
					res
						.status(401)
						.json({ success: false, message: 'Password incorrect' });
				}
			} catch (error) {
				console.error('Error logging in:', error);
				res.status(500).json({ success: false, message: error.message });
			}
		} catch (error) {
			res.status(500).json({ success: false, message: error.message });
		}
	} else {
		res.status(500).json({ success: false, message: 'User does not exist' });
	}
};

export const createUser = async (req, res) => {
	const { userDetails } = req.body;
	const exists = await checkUser(userDetails.email);
	if (!exists) {
		try {
			const hashedPassword = await bcrypt.hash(userDetails.password, 10);
			const insertQuery = `
        INSERT INTO users (username, email, password_hash, gender, age) VALUES ($1, $2, $3, $4, $5)
        `;
			let response = {};
			try {
				response = await pool.query(insertQuery, [
					userDetails.username,
					userDetails.email,
					hashedPassword,
					userDetails.gender,
					userDetails.age,
				]);
				res.status(201).json({ response });
			} catch (error) {
				console.error('Error creating user:', error);
				res.status(500).json({ success: false, message: error.message });
			}
		} catch (error) {
			res.status(500).json({ success: false, message: error.message });
		}
	} else {
		res.status(500).json({ success: false, message: 'User already exists' });
	}
};
