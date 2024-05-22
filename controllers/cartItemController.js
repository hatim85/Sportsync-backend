import CartItem from "../models/cartItemModel.js";

export const createCartItem=async(req,res)=>{
    try {
        const { cartId, productId, quantity } = req.body;
        const newCartItem = new CartItem({ cartId, productId, quantity });
        const savedCartItem = await newCartItem.save();
        console.log(savedCartItem)
        res.status(201).json(savedCartItem);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

export const getCartItem=async(req,res)=>{
    try {
        const cartItems = await CartItem.find();
        res.status(200).json(cartItems);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

export const updateCartItem=async(req,res)=>{
    try {
        const { id } = req.params;
        const { cartId, productId, quantity } = req.body;
        const updatedCartItem = await CartItem.findByIdAndUpdate(
          id,
          { cartId, productId, quantity },
          { new: true }
        );
        if (!updatedCartItem) {
          return res.status(404).json({ message: "Cart item not found" });
        }
        res.status(200).json(updatedCartItem);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

export const deleteCartItem=async(req,res)=>{
    try {
        const { id } = req.params;
        const deletedCartItem = await CartItem.findByIdAndDelete(id);
        if (!deletedCartItem) {
          return res.status(404).json({ message: "Cart item not found" });
        }
        res.status(200).json({ message: "Cart item deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}