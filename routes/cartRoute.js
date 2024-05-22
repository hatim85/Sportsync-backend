import express from 'express'
import { createCart, getCart, updateCart, deleteCart } from "../controllers/cartController.js"
import { checkcart, getCartProducts, removeFromCart, updateCartItemQuantity } from '../controllers/cartFinalController.js';

const router=express.Router();

router.post('/checkCart/:productId',checkcart)
router.get('/getcart/:userId',getCartProducts)
router.post('/create',createCart);
router.get('/get/:userId',getCart);
router.put('/update/:cartItemId',updateCartItemQuantity);
router.delete('/delete/:cartItemId',removeFromCart);

export default router;