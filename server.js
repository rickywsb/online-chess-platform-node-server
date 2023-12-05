import dotenv from 'dotenv';
import morgan from 'morgan';
import logger from './logger.js';
import mongoose from 'mongoose';
import usersRouter from './routes/userRouters.js';

import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import courseRoutes from './routes/courseRoutes.js';
import moduleRouter from './routes/moduleRoutes.js'; // 确保路径正确
import profileRouter from './routes/profile.js'; // 确保路径正确
import chessRoutes from './routes/chessRoutes.js';
import followRoutes from './routes/follow.js'; // Adjust the path as necessary

const app = express();
app.use(express.json());
dotenv.config();

// 记录一个 info 级别的日志
logger.info('Hello world');

// 记录一个 error 级别的日志
logger.error('Error message');

// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在的目录
const __dirname = dirname(__filename);


const accessLogStream = createWriteStream(join(__dirname, 'access.log'), { flags: 'a' });



// Apply middleware
app.use(cors());
app.use(morgan('dev'));
app.use(morgan('combined', { stream: accessLogStream }));
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message}`);
  next(err);
});

// Connect to MongoDB
const mongoURI = 'mongodb+srv://wusiboricky:zyq19960123@cluster0.cgta2mx.mongodb.net/?retryWrites=true&w=majority';
if (!mongoURI) {
  console.error('Missing MONGO_URI environment variable');
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
import authRoutes from './routes/authRoutes.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRouter);
app.use('/api', usersRouter);
app.use('/api/profile', profileRouter);
app.use('/chess', chessRoutes);
app.use('/api', followRoutes); // Adjust the path as necessary

// Set port
const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});



