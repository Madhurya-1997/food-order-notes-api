const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (process.env.NODE_ENV === "production") {
            mongoose.connect(process.env.DATABASE_URI_PROD)
        } else {
            mongoose.connect(process.env.DATABASE_URI)
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB;