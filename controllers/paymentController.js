import Payment from '../models/paymentModel.js';
import Order from '../models/orderModel.js';
import { instance } from '../index.js';
import User from '../models/userModel.js';
import Cart from '../models/cartModel.js';
import CartItem from '../models/cartItemModel.js';
import crypto from 'crypto';

export const createPayment = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100),  // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11"
    };
    const order = await instance.orders.create(options);
    const payment = new Payment({
      amount: options.amount,
      paymentDate: new Date(),
      paymentMethod: 'razorpay',
      razorpay_order_id: order.id
    });
    if (!payment) {
      console.log("payment not found")
    }
    const savedPayment = await payment.save();
    res.status(200).json({
      order
    })
  } catch (error) {
    console.log("inside createpayment error", error.message)
  }
};

export const paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    try {
      const payment = await Payment.findOneAndUpdate(
        { razorpay_order_id: razorpay_order_id },
        {
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature
        },
        { new: true }
      );
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' })
      }
      const { userId, totalAmount, products, cartItems } = req.query;

      const decodedProducts = JSON.parse(decodeURIComponent(products));
      const decodedCartItems = JSON.parse(decodeURIComponent(cartItems))
      const newOrder = new Order({
        userId: userId,
        products: decodedProducts,
        totalAmount: totalAmount,
        paymentId: payment._id,
        orderDate: new Date(),
        status: 'pending'
      });
      const savedOrder = await newOrder.save();
        // for (let i = 0; i < decodedCartItems.length; i++) {
        //   const cartItem = decodedCartItems[i];
        //   const cart = await Cart.findById(cartItem.cartId);
        //   if (cart) {
        //     const cartItem = new CartItem({
        //       cartId: cartItem.cartId,
        //       productId: cartItem.productId,
        //       quantity: cartItem.quantity
        //     });
        //     await cartItem.save();
        //   }
        // }

        if (savedOrder && decodedCartItems.length > 0) {
          const cart = await Cart.findOne({ userId: userId });
  
          if (cart) {
            for (const item of decodedCartItems) {
              await CartItem.findByIdAndDelete(item._id);
            }
  
            cart.cartItems.pull(...decodedCartItems.map(item => item._id));
            await cart.save();
          }
        } else {
          console.log("Failed to delete cart items");
        }
        
        // if (savedOrder && decodedCartItems.length > 0) {
        //   await Cart.findOneAndUpdate(
        //     { userId: userId },
        //     { $pull: { cartItems: { $in: decodedCartItems } } },
        //     { new: true }
        //   );
        // }
        // else {
        //   console.log("Failed to delete cart")
        // }

      res.redirect(`${process.env.CLIENT}/paymentsuccess`);
    }
    catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}