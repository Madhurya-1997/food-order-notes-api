require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnection");
const corsOptions = require("./config/corsOptions");
const errorHandler = require("./middleware/errorHandler");
const { logger, logEvents } = require("./middleware/logger");
const PORT = process.env.PORT || 3500;

// middlewares
app.use(logger);
app.use(express.json());
app.use(cookieParser())
app.use(cors(corsOptions));

// connection to mongoDB => orderDB
connectDB();

app.use('/', express.static(path.join(__dirname, 'public')));

// server route handlers
app.use('/', require('./routes/root'));
app.use('/users', require('./routes/userRoutes'));
app.use('/orders', require('./routes/orderRoutes'));

// no page found route handler
app.all('*', (req, res) => {
    res.status(404);

    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.send({ message: '404 Not found' });
    } else {
        res.type('txt').send('404 Not found');
    }
})

// middleware to create error log files
app.use(errorHandler);


// successfull connection to mongoDB
mongoose.connection.once('open', () => {
    console.log(`In ${process.env.NODE_ENV} environment`)
    console.log('Connected to orderDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
})

// connection error to mongoDB
mongoose.connection.on("error", err => {
    console.log(`In ${process.env.NODE_ENV} environment`)
    logEvents(`${err.no}\t${err.code}\t${err.syscall}\t${err.hostname}`,
        'mongoErrLog.log')
})
