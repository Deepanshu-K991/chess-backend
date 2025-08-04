const express = require("express");
const socket  = require("socket.io");
const http = require("http");
const {Chess} = require("chess.js");
const path = require("path"); 
const { scheduler } = require("timers/promises");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();

let players = {};
let currentPlayer = "w";

app.set("view engine" , "ejs");
app.use(express.static(path.join(__dirname , "public")));

app.get("/" , (req ,res)=> {
    res.render("index" , {title : "Chess game"});
});

io.on("connection" , function(uniquesocket){
    console.log("connected");
    // uniquesocket.on("test" , function() {
    //     console.log("test data recieved")
    //     io.emit("test data 1");
    // })
    
    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole" , "w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole" , "b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }
    socket.on("disconnect" , function(){
        if(uniquesocket.id === players.white){
            delete players.white
        }
        else if(uniquesocket.id === players.black){
            delete players.black
        }
    });
    uniquesocket.on("move" , (move) => {
        try {
            if(chess.turn()=== "w" && socket.id!= players.white) return;
            if(chess.turn()=== "b" && socket.id!= players.black) return;

           const result =  chess.move(move);
           if(result){
            currentPlayer = chess.turn();
            io.emit("move" , move);
           }
        } catch (error) {
            
        }
    })

});


server.listen(3000 ,function () {
    console.log("server listening on port 3000");
});