import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import mongoose from 'mongoose';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import houseRoutes from './routes/houseRoutes.js';

dotenv.config()

const app = express()
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors({
    origin: [
        'http://127.0.0.1:5501',
        'http://localhost:5501',
        'http://localhost:5173',
        'https://www.rezidenthomes.com',
        'https://rezidenthomes.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



//Routing
app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/houses', houseRoutes);


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