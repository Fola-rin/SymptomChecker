import { Router } from 'express';
import { createChat, getChats } from '../controllers/chats.js';

const router = Router();
router.get('/:sender_email', getChats);
router.post('/', createChat);

export default router;
