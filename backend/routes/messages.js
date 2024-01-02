import { Router } from 'express';
import { createMessage, getMessages } from '../controllers/messages.js';

const router = Router();
router.post('/', createMessage);
router.get('/:chat_id', getMessages);

export default router;
