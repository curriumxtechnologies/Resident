import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import mongoose from 'mongoose';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';

dotenv.config()

const app = express()
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



//Routing
app.use('/api/auth', authRoutes);


// Middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose
.connect(MONGO_URL)
.then(()=> {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});