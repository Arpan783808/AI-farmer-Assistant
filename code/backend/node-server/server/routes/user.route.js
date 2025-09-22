import express from "express";
import {updateUser, deleteUser, getUser, getProfile, getUsersNearby, getAllUsers} from "../controllers/user.controller.js"
import verifySession from "../utils/verifyUser.js";

const router = express.Router();

router.put('/update/:userId', verifySession, updateUser);
router.delete('/delete/:userId', verifySession, deleteUser);
router.get('/profile/:username', getProfile);
router.get('/:userId', getUser);
router.get('/getNearByUsers', verifySession, getUsersNearby);
router.get('/listUsers', verifySession, getAllUsers);



export default router