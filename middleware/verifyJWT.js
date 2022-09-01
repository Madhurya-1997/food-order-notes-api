const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Forbidden User' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decodedUser) => {
            req.user = decodedUser.UserInfo.username;
            req.roles = decodedUser.UserInfo.roles;
            next();
        }))
}

module.exports = verifyJWT;