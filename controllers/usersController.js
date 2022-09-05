const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Order = require("../models/order");



/**
 * Get all users
 * GET /users
 * private route
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password"); // exclude password from response   
    if (!users) {
        return res.status(400).json({
            message: "No users found"
        });
    }
    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
})

/**
 * Create new users
 * POST /users
 * private route
 */
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;

    // confirm request
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({
            message: "All request fields are required"
        });
    }

    // check if user already exists
    const user = await User.findOne({ username });
    if (user) {
        return res.status(409).json({
            message: `User already exists`
        });
    }

    // create new user
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userObject = {
        username,
        "password": hashedPassword,
        roles
    };

    const newUser = await User.create(userObject);

    if (newUser) {
        res.status(201).json({
            success: true,
            data: newUser
        });
    } else {
        res.status(400).json({
            message: "User not created !!"
        });
    }


})

/**
 * update user
 * PUT /users
 * private route
 */
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, password, roles, active } = req.body;

    // confirm request
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({
            message: "All request fields are required"
        });
    }

    // check if user already exists
    const user = await User.findById(id);
    if (!user) {
        return res.status(409).json({
            message: `User does not exist`
        });
    }
    // update original user
    if (user.username === username && user._id != id) {
        return res.status(409).json({ message: "Duplicate username" })
    }
    user.username = username;
    user.roles = roles;
    user.active = active;

    // only change the password if user sends a new password in the req
    if (password) {
        // hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.status(201).json({
        success: true,
        data: updatedUser
    });
})


/**
 * delete user
 * DELETE /users
 * private route
 */
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(100).json({ message: "Bad request!! User ID is required..." })
    }

    // dont delete the user if they have orders assigned to them
    const orders = await Order.find({ user: id });
    if (orders?.length) {
        return res.status(400).json({ message: "User has orders assigned to them" })
    }

    // find the user to delete
    const user = await User.findById(id);
    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }
    // delete the user
    const deletedUser = await user.deleteOne();
    res.status(200).json(
        {
            message: `Username ${deletedUser.username} with id ${deletedUser.id} has been successfully deleted`
        })
});



module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}