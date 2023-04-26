const bcrypt = require('bcryptjs');
const User = require('../models/User.js');
const { createError } = require('../utils/error');
const jwt = require('jsonwebtoken');

exports.register =async (req, res, next) => {
    try {
        console.log(req.body);
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password,salt);

        const newUser = new User({
            username: req.body.username,
            password: hash,
            email: req.body.email,
            
        })

        await newUser.save();
        res.status(200).json(newUser);
    } catch (error) {
        next(error);
    }
}

exports.login =async (req, res, next) => {
    try {
        const user = await User.findOne({email: req.body.email});
        if(!user) return next(createError(404,"User not found"));

        const isTrue =  bcrypt.compareSync(req.body.password, user.password);
        if(!isTrue) return next(createError(400,"Username or password incorrect"));
        const token = jwt.sign({id: user._id,username: user.username},process.env.secret);
        const {password,...other} = user._doc;
        res.
        cookie('access_token', token,{ httpOnly: false,})
        .status(200).json(other);
    } catch (error) {
        next(error);
    }
}