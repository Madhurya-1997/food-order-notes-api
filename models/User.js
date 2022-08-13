const mongoose = require("mongoose");


// username
// password
// active => for user access
// roles => [employee, manager, admin]

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    roles: [{
        type: String,
        default: "Employee"
    }]
})


module.exports = mongoose.model("User", userSchema);