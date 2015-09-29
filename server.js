// crypto (for uid)
var crypto = require("crypto");

// express App
var express = require('express');
var app = express();

// peer server
var peer = require('peer').ExpressPeerServer;

/** VARS **/
// connected users
var users = [];


/** HTTP SERVER **/
// http server
var server = require('http').createServer(app);


// static files
app.use(express.static('static')); //go through this file when connect - typical in express' framework

// peer
app.use('/peer', peer(server, {debug: true})); //when we call the peer route, we call peer(server..

// routing
app.get('/', function (req, res) { //when we type the address with /, we go directly on index.html
	res.sendfile('index.html');
});


/** IO **/

var io = require('socket.io')(server);
io.on('connection', function (socket) {

	// user
	socket.user = {
		id: crypto.randomBytes(20).toString('hex')
	};

	// get user id
	socket.on('getUserId', function(){
		// return user id (only to user)
		socket.emit('getUserId', socket.user.id);
	});

	// get users list
	socket.on('getUsersList', function(){

		// if we ask for user list, it means we are connected to peer
		users.push(socket.user.id);

		// emit users list to everybody
		io.emit('getUsersList', users);
	});

	// disconnect
	socket.on('disconnect', function(){

		// remove user from list
		var i = 0;
		for(i; i < users.length; i++){
			if(users[i] == socket.user.id){
				users.splice(i, 1);
			}
		}

		// emit users list to everybody
		io.emit('getUsersList', users);
	});
});

/** START **/

server.listen(3000, function(){
	console.log('start');
});