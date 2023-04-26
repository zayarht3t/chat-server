const { createError } = require("./error");
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if(!token) return next(createError(401,"You are not authenticated"));
    jwt.verify(token,process.env.secret,(err,user)=>{
        if(err) return next(createError(403,"You are not authorized"));
        req.user = user;
        next();
    })
}

exports.verifyUser = (req,res,next) => {
    this.verifyToken(req,res,next,()=>{
        console.log(req.user._id," ",req.params.id);
        if(req.user._id === req.params.id || req.user.isAdmin){
            next();
        }else{
             return next(createUser(403,"You can only manage your account"));
        }
    })
}

exports.verifyAdmin = (req,res,next) => {
    verifyToken((req,res,next)=>{
        if( req.user.isAdmin){
            next();
        }else{
            next(createUser(403,"You are not admin"));
        }
    })
}