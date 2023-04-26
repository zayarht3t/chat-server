const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRouter = require('./routes/auth.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const ws = require('ws');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Message = require('./models/Message.js');
const MessageRouter = require('./routes/message.js');

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();
const corsOptions = {
    origin: true, //included origin as true
    credentials: true,
    methods: "GET,PUT,POST,DELETE" //included credentials as true
};

app.use(cors(corsOptions));


//error middleware
app.use((err,req,res,next)=>{
    const errMsg = err.message || "something went wrong";
    const statusCode = err.status || 500;
    return res.status(statusCode).json({message: errMsg})});

app.use('/api/auth',authRouter);
app.use('/api/messages',MessageRouter);


const server = app.listen(process.env.port);


mongoose.connect(process.env.MONGODB_URI)
    .then(console.log("database connection established"))
    .catch(error=>console.log(error));

const wws = new ws.WebSocketServer({server});
wws.on('connection',(connection,req)=>{
    console.log("connection established");
    if(req.headers.cookie){
        const token = req.headers.cookie.split('=')[1];
        jwt.verify(token,process.env.secret,{},(err,userData)=>{
            if(err) return next(err);
            const {id,username} = userData;
            connection.userId = id;
            connection.username = username;
        })
        
    }else{
        console.log('error');
    }

    //send online users
    [...wws.clients].forEach(client =>{
        client.send(JSON.stringify({online: [...wws.clients].map(c=>({userId: c.userId,username: c.username}))}))
    })


    //send message to recipients
    connection.on('message',async (message) => {
        const {recipient,text} =JSON.parse(message.toString());
        console.log(text);
        if(recipient && text){
            const MessageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                message: text
            });  

            [...wws.clients].filter(c => c.userId === recipient)
            .forEach(user =>user.send(JSON.stringify({ text,sender: connection.userId,recipient,id: MessageDoc._id})));
        }
    })
})