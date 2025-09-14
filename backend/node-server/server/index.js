import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import connectDB from './config/connectDB.js';

import admin from 'firebase-admin';
import mongoose from 'mongoose';
import firebaseInit from './config/firebaseInit.js';

import aiRoutes from './routes/ai.route.js';
import authRoutes from './routes/auth.route.js';
import cropRoutes from './routes/crop.route.js';
import alertRoutes from './routes/alert.route.js';
import chatRoutes from './routes/chat.route.js';
// import precautionRoutes from './routes/precaution.route.js';
// import newsRoutes from './routes/news.route.js';

dotenv.config();
connectDB();
firebaseInit();
const corsOptions = {
	origin: [
		process.env.CORS_ORIGIN || 'http://localhost:5173',
		'http://localhost:5174',
	],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
	exposedHeaders: ['Content-Type', 'Authorization'],
};
const app = express();
app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 10000;

app.use('/api/v1/ai', aiRoutes);
app.use('/api', authRoutes);
app.use('/api/v1/crop', cropRoutes);
app.use('/api/v1/alert', alertRoutes);
app.use('/api/chat', chatRoutes);
// app.use('/api/v1/news', newsRoutes);
// app.use('/api/v1/precautions', precautionRoutes);

app.use((err, req, res, next) => {
	console.error('Server error:', err);
	res.status(err.status || 500).json({
		error:
			process.env.NODE_ENV === 'production'
				? 'Internal server error'
				: err.message,
	});
});

app.use((req, res) => {
	res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
