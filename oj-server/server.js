const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
var socketIO = require('socket.io');
var io = socketIO();
var editorSocketService = require('./services/editorSocketService')(io);
const restRouter = require('./routes/rest');


//connect to mongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://erinbiubiubiu:summerday.123@ds239368.mlab.com:39368/testv1');

//app.get('/', (req, res) => res.send('Hello World!!'));
app.use('/api/v1', restRouter);
app.use(express.static(path.join(__dirname, '../public')));

//app.listen(3000, () => console.log('Example app listening on port 3000!'));
const server = http.createServer(app);
io.attach(server);
server.listen(3000);
server.on('listenging', onListening);

function onListening() {
  console.log('App is listening on port 3000!');
}

//url not handled by router on the server side, then server send index.html under public folder
app.use((req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../public')});
});
