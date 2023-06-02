const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require("http");
const { api_secret_key } = require('./config');
const jwt = require('jsonwebtoken');

app.set("api_secret_key", require("./config").api_secret_key);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

app.use("/users", require("./controllers/userController"))


const server = http.createServer(app);
const io = require("socket.io")(server , { cors: { origin: "*" }});

io.use(function(socket, next){
    if (socket.handshake.query && socket.handshake.query.token){
      jwt.verify(socket.handshake.query.token, api_secret_key, function(err, decoded) {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        next();
      });
    }
    else {
      next(new Error('Authentication error'));
    }    
}).on("connection", (socket) => {
    console.log("Bağlandı: " + socket.id);
    socket.on("joinRoom", (roomName) => {
        io.sockets.adapter.sids.get(socket.id).forEach((room) => {
            if(room != socket.id){
                socket.leave(room);
            }
        })
        socket.join(roomName);
        console.log(`Odaya katıldı: ${socket.id} - ${roomName}`);
        console.log(`Oldugum Odaler: ${socket.id} - ${io.sockets.adapter.sids.get(socket.id).size}`);
    })

    socket.on("sendMessage", (data) => {
        io.to(data.room).emit("receiveMessage", data);
        console.log(data);
    })
});


server.listen(process.env.PORT || 5000, () => console.log(`Server started on port ${process.env.PORT || 5000}`));
