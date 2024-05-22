import mongoose from "mongoose";
import Cart from "./cartModel.js";
import Product from "./productModel.js";

const cartItemSchema=mongoose.Schema({
    cartId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Cart',
        required:true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        default:1
    }
})

const CartItem = mongoose.model('CartItem', cartItemSchema)
export default CartItem;