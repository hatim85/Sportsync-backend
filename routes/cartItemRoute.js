import express from 'express'
import Product from '../models/productModel.js';
import CartItem from '../models/cartItemModel.js';
import { createCartItem, getCartItem, updateCartItem, deleteCartItem } from '../controllers/cartItemController.js';
import { addToCart, removeFromCart, updateCartItemQuantity } from '../controllers/cartFinalController.js';
const router=express.Router();

router.post('/addToCart/:productId',addToCart)
router.delete('/remove/:cartItemId',removeFromCart)
router.put('/updateqty/:cartItemId',updateCartItemQuantity)
router.post('/create',createCartItem);
router.get('/get',getCartItem);
router.put('/update/:id',updateCartItem);
router.delete('/delete/:id',deleteCartItem);

export default router;