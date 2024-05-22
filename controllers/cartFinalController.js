import CartItem from "../models/cartItemModel.js";
import Cart from "../models/cartModel.js";
import Address from "../models/addressModel.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";
// Product description page - Handle Add to Cart button click
export const addToCart = async (req, res) => {
    let { productId } = req.params;
    const { userId } = req.body; // Assuming user ID is available in req.user after authentication
    try {
        // Check if the product is already in the user's cart
        let cart = await Cart.findOne({ userId }).populate('cartItems').exec();
        console.log("Existing Cart:", cart);

        if (!cart) {
            console.log("Cart is not found, creating a new one");
            cart = await Cart.create({ userId, cartItems: [] });
            console.log("New Cart:", cart);
        }

        productId = String(productId);
        let cartItem = await CartItem.findOne({ cartId: cart._id, productId }).exec();
        
        if (cartItem) {
            // console.log("Existing Cart Item found:", cartItem);
            cartItem.quantity++;
        } else {
            // console.log("No existing Cart Item found, creating a new one");
            // Add new product to cart with quantity of 1
            cartItem = await CartItem.create({ cartId: cart._id, productId });
            // console.log("New Cart Item created:", cartItem);
            // console.log("cartItems: ",cart.cartItems)
            cart.cartItems.push(cartItem);
            cart.markModified('cartItems');
        }

        await cartItem.save();
        await cart.save();
        console.log("Updated Cart:", cart);
        res.json(cartItem);
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


// Cart page - Display list of cart items
export const getCartProducts= async (req, res) => {
    const userId = req.params.userId; // Assuming user ID is available in req.user after authentication
    // console.log(userId)
    // try {
    //     const cart = await Cart.findOne({ userId }).populate('cartItems.productId').exec();

    //     if (!cart) {
    //         console.log(cart)
    //         return res.status(404).json({ message: 'Cart not found' });
    //     }
    //     // console.log(cart.cartItems)
    //     res.json(cart.cartItems);
    // } catch (error) {
    //     console.error('Error retrieving cart items:', error);
    //     res.status(500).json({ message: 'Internal server error' });
    // }

    try {
        const cart = await Cart.findOne({ userId }).populate({
            path: 'cartItems',
            populate: {
                path: 'productId',
                model: 'Product'
            }
        }).exec();

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const populatedCartItems = cart.cartItems.map(item => ({
            cartItemId:item._id,
            quantity: item.quantity,
            product: {
                _id: item.productId._id,
                name: item.productId.name,
                price:item.productId.price,
                image: item.productId.image,
                description: item.productId.description,
                // quantity:item.productId.quantity
                // Add other fields you want to include from the Product model
            }
        }));
        populatedCartItems.forEach(item => {
            // console.log(item.product._id)
            // console.log(item.quantity)
            // console.log(item.product.name);
            // console.log(item.product.price);
            // console.log(item.cartItemId)
        });
        res.json(populatedCartItems);
    } catch (error) {
        console.error('Error retrieving cart items:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const removeFromCart = async (req, res) => {
    // console.log(req.params);
    const { cartItemId } = req.params;
    // console.log(cartItemId)
    try {
        // Find the cart item by ID
        const cartItem = await CartItem.findById(cartItemId);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        // Find the cart associated with the cart item
        const cart = await Cart.findOne({ cartItems: cartItemId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove the cart item from the cart's cartItems array
        cart.cartItems.pull(cartItemId);
        await cart.save();

        // Delete the cart item from the CartItem collection
        await CartItem.findByIdAndDelete(cartItemId);

        res.json({ message: 'Product removed from cart' });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateCartItemQuantity = async (req, res) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    try {
        // Find the cart item by ID
        const cartItem = await CartItem.findById(cartItemId);

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        // Update the quantity of the cart item
        cartItem.quantity = quantity;
        await cartItem.save();

        res.json({ message: 'Cart item quantity updated' });
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Check if the product is in the user's cart
export const checkcart=async (req, res) => {
    const { productId } = req.params;
    const { userId } = req.body;

    try {
        const cart = await Cart.findOne({ userId }).populate('cartItems').exec();
        if (!cart) {
            return res.json({ inCart: false });
        }
        const cartItem = cart.cartItems.find(item => item.productId === productId);
        const inCart = cartItem ? true : false;
        res.json({ inCart });
    } catch (error) {
        console.error('Error checking cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};