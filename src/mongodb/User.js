'use strict';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let UserSchema = new Schema({
    username: String,
    password: String,
    scope: String
});

module.exports = mongoose.model('User', UserSchema);

