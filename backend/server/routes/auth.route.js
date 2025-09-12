import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";
import express from 'express'
import {signin, logout, checkSession} from '../controllers/auth.controller.js'
const router = express.Router();
router.post("/phone", signin);
router.post("/session", checkSession);
router.post("/logout", logout);
export default router;
