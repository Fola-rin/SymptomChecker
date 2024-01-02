import { Router } from 'express';
import { createChat, getChats } from '../controllers/chats.js';
import { UserLogin, createUser } from '../controllers/users.js';

const router = Router();
router.post('/', createUser);
router.post('/login', UserLogin);

export default router;
