const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Order = require("../models/order");



/**
 * Get all orders
 * GET /orders
 * private route
 */
const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().lean();

    if (!orders?.length) {
        return res.status(400).json({
            message: 'No orders found !'
        });
    }

    const ordersWithUser = await Promise.all(orders.map(async (order) => {
        const user = await User.findById(order.user).lean().exec();
        return { ...order, username: user.username };
    }))

    res.status(200).json({
        success: true,
        count: orders.length,
        data: ordersWithUser
    });
})

/**
 * Create new order
 * POST /order
 * private route
 */
const createNewOrder = asyncHandler(async (req, res) => {
    // user in req.body is the ObjectID of user
    const { user, title, text } = req.body;

    // confirm request
    if (!user || !title || !text) {
        return res.status(400).json({
            message: "All request fields are required"
        });
    }

    // check if order already exists
    const order = await Order.findOne({ title });
    if (order) {
        return res.status(409).json({
            message: 'Order already exists'
        });
    }

    // create new order
    const newOrder = await Order.create({ user, title, text });
    if (newOrder) {
        res.status(201).json({
            success: true,
            data: newOrder
        });
    } else {
        res.status(400).json({
            message: "Order not created !!"
        });
    }
})

/**
 * update order
 * PUT /orders
 * private route
 */
const updateOrder = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body;

    // confirm request
    if (!user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({
            message: "All request fields are required"
        });
    }

    // check if order already exists
    const order = await Order.findById(id);
    if (!order) {
        return res.status(409).json({
            message: `Order does not exist`
        });
    }
    // update original order
    order.user = user;
    order.title = title;
    order.text = text;
    order.completed = completed;

    const updatedOrder = await order.save();

    res.status(201).json({
        success: true,
        data: updatedOrder
    });
})


/**
 * delete order
 * DELETE /orders
 * private route
 */
const deleteOrder = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(100).json({ message: "Bad request!! Order ID is required..." })
    }

    // find the order to delete
    const order = await Order.findById(id);
    if (!order) {
        return res.status(400).json({ message: "Order not found" })
    }
    // delete the order
    const deletedOrder = await order.deleteOne();
    res.status(200).json(
        {
            message: `${deletedOrder.title} order has been deleted. The order was assigned to user with user ID ${deletedOrder.user}`
        })
});



module.exports = {
    getAllOrders,
    createNewOrder,
    updateOrder,
    deleteOrder
}