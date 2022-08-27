const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

// order ticket id => unique and added sequentially
// title
// text
// completed => set to false when order is placed initially (PENDING)
// user => reference to user

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})


orderSchema.plugin(AutoIncrement,
    {
        inc_field: 'ticket',
        id: 'orderId',
        start_seq: 100
    }
);

module.exports = mongoose.model("Order", orderSchema);