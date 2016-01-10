var app = require('http').createServer(handler);
var io = require('socket.io')(app);

var redis = require('socket.io-redis');
io.adapter(redis({ host: "127.0.0.1", port: "6379" }));

var fs = require('fs');
var i = 0;
var user_socket_map = {};
var userids = ["u1","u2"];
var userids2 = ["u1","u2"];
//app.listen(8013);
app.listen(8014);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function(err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}


io.set('authorization', function(handshakeData, accept) {
	//console.log(handshakeData.headers.cookie);
    var cookies = handshakeData.headers.cookie;
    //获取用户登录信息
    var userID = userids.pop(); //假设获取到的useID
    //console.log(userID);
    var session = {
    	user:{
    		_id:userID
    	}
    }

    if(userID){
    	handshakeData.headers.sessions = session;
    	accept(null, true); //验证通过
    }else{
    	accept(null, false); //验证失败
    }
});

var Notice = io.on('connection', function(socket) {
    //页面刷新会重连，id将会改变
    console.log("socket.id:",socket);
    var user = socket.handshake.headers.sessions.user;
    var id = user && user._id;
    user_socket_map[id] = socket;
    //伪代码
    //将socket.id存到redis
    redis.saveSocketID(id,socket.id);

    socket.on('my other event', function(data) {
        //console.log(data);
    });

    //页面刷新或关闭会断开连接
    socket.on('disconnect', function() {
    	delete user_socket_map[id];
    	userids.push(id);
        console.log('user disconnected:',id);
        //socket.emit('user disconnected');
    });
});

var numMap = {};
setInterval(function() {
	var index = Math.round(Math.random()*1);
	var user = userids2[index];
	if(!numMap[user]){
		numMap[user] = 0
	}
	socketObj = user_socket_map[user]; 
	if (socketObj) {
	    socketObj.emit('news', {
	        userID:user,
	        num: ++numMap[user]
	    });
	}
}, 1000);

//伪代码
redis.getSocketID(userID,function(err,socketIds){
    for(var i = 0; i < socketIds.length;i ++){
        Notice.to(socketIds[i]).emit('notice', data);
    }
});
