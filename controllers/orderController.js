import Order from "../models/orderModel.js";

export const getAllOrders=async(req,res)=>{
    try{
        const { userId } = req.params;

    // Find orders with populated product details using Mongoose's populate()
    const orders = await Order.find({ userId })
      .populate({
        path: "products",
        populate: { path: "productId" }, // Populate product details from Product model
      });

    if (!orders) {
      return res.json("No orders found");
    }

    const ordersWithProducts = orders.filter((order) => order.products.length > 0);

    res.status(200).json(ordersWithProducts);
    }
    catch(error){
        res.status(500).json({message:error.message});
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