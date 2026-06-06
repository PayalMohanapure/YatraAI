const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default || require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    chatHistory: [{
        role: String,
        content: String
    }],
    profileImage: {
        url: String,
        filename: String
    },
    firstName: String,
    lastName: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
