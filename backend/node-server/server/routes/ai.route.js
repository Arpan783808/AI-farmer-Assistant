import { spawn } from 'child_process';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import verifySession from '../utils/verifyUser.js';
const router = express.Router();

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 25 * 1024 * 1024,
	},
	fileFilter: (req, file, cb) => {
		if (
			file.mimetype.startsWith('audio/') ||
			file.mimetype.startsWith('image/')
		) {
			cb(null, true);
		} else {
			cb(new Error('Only audio and image files are allowed!'), false);
		}
	},
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post(
	'/chat', verifySession,
	upload.fields([
		{ name: 'audio_file', maxCount: 1 },
		{ name: 'image_file', maxCount: 1 },
	]),
	async (req, res) => {
		let tempAudioPath = null;
		let tempImagePath = null;

		try {
			const audioFile = req.files?.audio_file?.[0];
			const imageFile = req.files?.image_file?.[0];
			const textInput = req.body.text_input?.trim();
			const hasImageFlag = req.body.has_image === 'true';

			if (!audioFile && !textInput && !imageFile && !hasImageFlag) {
				return res.status(400).json({
					success: false,
					error: 'Please provide audio, text, or image input',
				});
			}

			console.log('🔄 Processing AI request:', {
				hasAudio: !!audioFile,
				hasText: !!textInput,
				hasImage: !!imageFile || hasImageFlag,
				audioSize: audioFile ? audioFile.size : 0,
				imageSize: imageFile ? imageFile.size : 0,
			});

			const pythonScriptPath = path.resolve(
				__dirname,
				'../../../ai-agent/malayalam_api_bridge.py'
			);

			if (!fs.existsSync(pythonScriptPath)) {
				throw new Error(`Python script not found: ${pythonScriptPath}`);
			}

			const pythonArgs = [pythonScriptPath];

			if (audioFile) {
				tempAudioPath = path.join('/tmp', `audio_${Date.now()}.webm`);
				fs.writeFileSync(tempAudioPath, audioFile.buffer);
				pythonArgs.push('--audio-file', tempAudioPath);
				console.log('🎵 Audio saved to:', tempAudioPath);
			}

			if (textInput) {
				pythonArgs.push('--text', textInput);
				console.log('📝 Text input:', textInput.substring(0, 50) + '...');
			}

			if (imageFile) {
				tempImagePath = path.join('/tmp', `image_${Date.now()}.jpg`);
				fs.writeFileSync(tempImagePath, imageFile.buffer);
				pythonArgs.push('--image-file', tempImagePath);
				console.log('🖼️ Image saved to:', tempImagePath);
			} else if (hasImageFlag) {
				pythonArgs.push('--has_image');
			}

			console.log('🐍 Launching Python with args:', pythonArgs.slice(1));

			const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

			const pyProcess = spawn(pythonCmd, pythonArgs, {
				cwd: path.dirname(pythonScriptPath),
				stdio: ['pipe', 'pipe', 'pipe'],
				env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
			});

			pyProcess.stdin.end();

			let stdout = '';
			let stderr = '';

			pyProcess.stdout.on('data', (data) => {
				stdout += data.toString();
			});

			pyProcess.stderr.on('data', (data) => {
				stderr += data.toString();
				console.error('Python stderr:', data.toString());
			});

			pyProcess.on('close', (code) => {
				if (tempAudioPath && fs.existsSync(tempAudioPath)) {
					fs.unlinkSync(tempAudioPath);
					console.log('🗑️ Cleaned audio temp file');
				}
				if (tempImagePath && fs.existsSync(tempImagePath)) {
					fs.unlinkSync(tempImagePath);
					console.log('🗑️ Cleaned image temp file');
				}

				if (code !== 0) {
					console.error(`❌ Python process failed with code ${code}`);
					return res.status(500).json({
						success: false,
						error: 'AI processing failed',
						details: stderr.trim(),
						exit_code: code,
					});
				}

				try {
					const result = JSON.parse(stdout.trim());
					console.log('✅ AI processing successful');

					console.log('📤 Response summary:', {
						success: result.success,
						hasText: !!result.response_text,
						hasAudio: !!result.audio_base64,
						transcribed: result.transcribed_text
							? result.transcribed_text.substring(0, 30) + '...'
							: null,
					});

					return res.json(result);
				} catch (parseError) {
					console.error('❌ JSON parse error:', parseError.message);
					console.error('Raw Python output:', stdout.substring(0, 500));
					return res.status(500).json({
						success: false,
						error: 'Invalid AI response format',
						details: parseError.message,
						raw_output: stdout.trim().substring(0, 200),
					});
				}
			});

			pyProcess.on('error', (error) => {
				console.error('❌ Python spawn error:', error.message);

				if (tempAudioPath && fs.existsSync(tempAudioPath)) {
					fs.unlinkSync(tempAudioPath);
				}
				if (tempImagePath && fs.existsSync(tempImagePath)) {
					fs.unlinkSync(tempImagePath);
				}

				return res.status(500).json({
					success: false,
					error: 'Failed to start AI processing',
					details: error.message,
				});
			});

			setTimeout(() => {
				if (!pyProcess.killed) {
					pyProcess.kill('SIGTERM');
					console.log('⏰ Python process timed out, terminated');

					if (!res.headersSent) {
						return res.status(408).json({
							success: false,
							error: 'AI processing timed out',
						});
					}
				}
			}, 60000);
		} catch (error) {
			console.error('❌ Route error:', error.message);

			if (tempAudioPath && fs.existsSync(tempAudioPath)) {
				fs.unlinkSync(tempAudioPath);
			}
			if (tempImagePath && fs.existsSync(tempImagePath)) {
				fs.unlinkSync(tempImagePath);
			}

			return res.status(500).json({
				success: false,
				error: 'Internal server error',
				details: error.message,
			});
		}
	}
);

router.get('/health', (req, res) => {
	return res.json({
		success: true,
		message: 'AI Farming Assistant service is healthy',
		timestamp: new Date().toISOString(),
		services: {
			gemini: 'Available',
			whisper: 'Available',
			tts: 'Available',
		},
	});
});

export default router;
