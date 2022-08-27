const router = require('express').Router();
const ordersController = require('../controllers/ordersController');

router.route('/')
    .get(ordersController.getAllOrders)
    .post(ordersController.createNewOrder)
    .put(ordersController.updateOrder)
    .delete(ordersController.deleteOrder);

module.exports = router;