import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import User from './models/userModel.js';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoute.js';
import authRoutes from './routes/authRoute.js';
import categoryRoutes from './routes/categoryRoute.js';
import productRoutes from './routes/productRoute.js';
import cartRoutes from './routes/cartRoute.js';
import orderRoutes from './routes/orderRoute.js';
import paymentRoutes from './routes/paymentRoute.js';
import adminRoutes from './routes/adminRoute.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Razorpay from 'razorpay';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin'
import { readFile } from 'fs/promises';

dotenv.config();

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const serviceAccount=JSON.parse(
  await readFile(
    new URL('./firebase-adminsdk.json',import.meta.url)
  )
)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, 'client', 'dist')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'client', 'dist', 'index.html'));
});

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/getkey', (req, res) => res.status(200).json({ key: process.env.RAZORPAY_API_KEY }));

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
