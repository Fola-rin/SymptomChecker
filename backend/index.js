import express from 'express';
import messagesRoutes from './routes/messages.js';
import chatsRoutes from './routes/chats.js';
import usersRoutes from './routes/users.js';

import cors from 'cors';
import bodyParser from 'body-parser';
// env.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/api/messages', messagesRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/users', usersRoutes);

// const port = 3000;
const port = 10000;

const start = async () => {
	try {
		app.listen(port, '0.0.0.0', () => {
			console.log(`Server running on port ${port}`);
		});
	} catch (error) {
		console.log(error);
	}
};

start();
