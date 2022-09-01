const router = require('express').Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter');

// login - authentication
router.route('/')
    .post(loginLimiter, authController.login)

// get a new access token on client's page reload
router.route('/refresh')
    .get(authController.refresh)


// logout
router.route('/logout')
    .post(authController.logout)

module.exports = router;