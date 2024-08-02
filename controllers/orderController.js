import Order from "../models/orderModel.js";

export const getAllOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate({
        path: "products",
        populate: { path: "productId" },
      });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    const validOrders = orders.filter(order => order !== null);
    res.status(200).json(validOrders);
  } catch (error) {
    res.status(500).json({
      message: 'Error in fetching orders',
      error: error.message,
    });
  }
}


export const updateStatus=async(req,res)=>{
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { status },
          { new: true }
        );
        if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

export const getAllAdminOrders=async(req,res)=>{
  try{
      const page = req.query.page || 1;
      const pageSize = 10; 
      const skip = (page - 1) * pageSize;

      const orders = await Order.find()
          .skip(skip)
          .limit(pageSize);

      res.status(200).json(orders);
  }
  catch(error){
    res.status(500).json({message:error.message})
  }
} 