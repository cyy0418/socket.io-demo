### 分布式socket.io一对一

``` bash
    npm instal socket.io
    npm install socket.io-redis
```

使用 `socket.io-redis`

``` js
    var redis = require('socket.io-redis');
    io.adapter(redis({ host: settings.REDIS_HOST, port: settings.REDIS_PORT }));
    var Notice = io..on('connection', function(socket) {
    
    });
```

建立连接时将socket.id存到redis;
发送消息时，从redis获取socke.id;
然后调用 `Notice.to(socketId).emit('notice', data);`
