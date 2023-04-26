const express = require('express');
const Message = require('../models/Message');
const router = express.Router();
const jwt  = require('jsonwebtoken');
const User = require('../models/User.js');

async function getUserDataFromRequest(req) {
    

    return new Promise((resolve, reject) => {
        const token = req.cookies?.access_token;
        if(token){
            jwt.verify(token,process.env.secret,{},(err,userData)=>{
            if(err)  throw err;
            resolve(userData);
        })
        }
        
    })
}

router.get('/messages/:id',async function (req, res) {
        const {id} = req.params;
        const userData = await getUserDataFromRequest(req);
        const ourId = userData.id;
        console.log(id,ourId)
        const messages = await Message.find({
            sender: {$in: [id,ourId]},
            recipient: {$in: [id,ourId]}
        }).sort({createdAt: -1})

        res.status(200).json(messages);
})

router.get('/people',async function(req,res,next){
    try {
        const users =  await User.find();
    res.status(200).json(users);
    } catch (error) {
        next(error);
    }
    
})

module.exports = router;