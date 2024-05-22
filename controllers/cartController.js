import Cart from "../models/cartModel.js";

// @route   POST /api/cart/create
export const createCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const newCart = new Cart({ userId });
    const savedCart = await newCart.save();
    res.status(201).json(savedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cart by user ID
// @route   GET /api/cart/get/:userId
export const getCart = async (req, res) => {
  try {
    // const userId = req.params.userId;
    const userId=req.params.userId;
    console.log(userId)
    const cart = await Cart.findOne({ userId });
    console.log(cart)
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/cart/update/:id
export const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const updatedCart = await Cart.findByIdAndUpdate(
      id,
      { userId },
      { new: true }
    );
    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/cart/delete/:id
export const deleteCart = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCart = await Cart.findByIdAndDelete(id);
    if (!deletedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json(deletedCart)
    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};