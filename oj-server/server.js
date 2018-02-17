const express = require('express');
const app = express();
const restRouter = require('./routes/rest');

//connect to mongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://erinbiubiubiu:summerday.123@ds239368.mlab.com:39368/testv1');

//app.get('/', (req, res) => res.send('Hello World!!'));
app.use('/api/v1', restRouter);
app.listen(3000, () => console.log('Example app listening on port 3000!'));
