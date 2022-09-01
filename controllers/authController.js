const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


/**
 * POST /auth
 * public route
 */
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username });

    if (!foundUser) {
        return res.status(401).json({ message: 'Unauthorized personnel !' })
    }
    if (!foundUser.active) {
        return res.status(401).json({ message: `User with username: ${foundUser.username} is inactive !` })
    }

    const passwordMatched = await bcrypt.compare(password, foundUser.password);

    if (!passwordMatched) {
        return res.status(401).json({ message: 'Password does not match. Unauthorized personnel !' })
    }

    const accessToken = jwt.sign(
        {
            'UserInfo': {
                'username': foundUser.username,
                'roles': foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10s' }
    )
    const refreshToken = jwt.sign(
        { 'username': foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '60s' }
    )



    /** set cookie 
     * (containing the refresh token) 
     * in response headers 
     * before sending res back to client
    */
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'None', // cross site cookie in res header
        // secure: true // https - in production
        secure: false
    })

    res.status(200).json({ accessToken, refreshToken });


})

/**
 * GET /auth/refresh
 * public route - when access token is expired
 */
const refresh = (req, res) => {

    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized personnel !' })

    const refreshToken = cookies.jwt;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            /**
             * Decoded user will have this format 
             * {
                'UserInfo': {
                    'username': foundUser.username,
                    'roles': foundUser.roles
                }
             * }
             *
             */

            //decoded: {username: 'nilofar', iat: 1662004303, exp: 1662004363}
            const foundUser = await User.findOne({ username: decoded.username }).exec();

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized User !!' })

            const accessToken = jwt.sign(
                {
                    'UserInfo': {
                        'username': foundUser.username,
                        'roles': foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10s' }
            )

            res.status(200).json({ accessToken })
        }))

}


/**
 * POST /auth/logout
 * public route - to clear cookies or tokens if exists
 */
const logout = (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(204).json({ message: 'No content !!' });

    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None', // cross site cookie in res header
        secure: true // https
    });
    res.end();
    res.json({ message: 'Cookies cleared, user logged out !' });
}

module.exports = {
    login,
    refresh,
    logout
};