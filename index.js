import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import User from './models/userModel.js';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoute.js'
import authRoutes from './routes/authRoute.js'
import categoryRoutes from './routes/categoryRoute.js'
import productRoutes from './routes/productRoute.js'
import cartRoutes from './routes/cartRoute.js'
import cartItemRoutes from './routes/cartItemRoute.js'
import orderRoutes from './routes/orderRoute.js'
import paymentRoutes from './routes/paymentRoute.js'
import adminRoutes from './routes/adminRoute.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import Razorpay from 'razorpay';
import path from 'path';

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

//remove this if something went wrong
app.use(express.urlencoded({extended:true}))

app.use(cors());

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET
});

app.get('/', (req, res) => {
  app.use(express.static(path.resolve(__dirname,"client","dist")));
  res.sendFile(path.resolve(__dirname,"client","dist","index.html"));
})

app.use('/api/user',userRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/products',productRoutes);
app.use('/api/cart',cartRoutes);
app.use('/api/cartItem',cartItemRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/payment',paymentRoutes);
app.use('/api/admin',adminRoutes);
app.get('/api/getkey',(req,res)=>res.status(200).json({key:process.env.RAZORPAY_API_KEY}))

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

