const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    recipient: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message: {
        type: String,
    }
},{timestamps: true});

module.exports = mongoose.model('Message', MessageSchema);