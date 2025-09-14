import express from 'express';
import { 
    // createChat, 
         sendMessage, 
         getChatList,        
         getChatById,        
         updateChatTitle,
         deleteChat
       } from '../controllers/chat.controller.js';  
import verifySession from '../utils/verifyUser.js';

const router = express.Router();

// router.post('/newChat', verifySession, createChat);  
router.post('/sendMessage', verifySession, sendMessage);  
router.get('/getAllChats', verifySession, getChatList);  // list for side bar
router.get('/get/:chatId', verifySession, getChatById);  // complete chat
router.patch('/update/:chatId', verifySession, updateChatTitle);  
router.delete('/delete/:chatId', verifySession, deleteChat);
export default router;