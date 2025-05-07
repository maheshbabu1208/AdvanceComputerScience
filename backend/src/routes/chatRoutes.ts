import express from 'express';
import multer from 'multer';
import { handleChat } from '../controllers/chatController';

const router = express.Router();
const upload = multer({ dest: '/tmp/' });

router.post('/chat', upload.single('file'), handleChat);

export default router; 