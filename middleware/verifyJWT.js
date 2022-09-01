const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Forbidden User' });
    }

    const accessToken = authHeader.split(' ')[1];

    jwt.verify(accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
            next();
        }))
}

module.exports = verifyJWT;