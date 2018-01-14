let config = require('dotenv').config().parsed;
let mongoose = require('mongoose');
console.log(config.MONGO_URI);
mongoose.connect(config.MONGO_URI, (err) => {
    if (err) return console.log(err);
    console.log('Mongoose Connected');
});
let db = {};
db.OAuthAccessToken = require('./OAuthAccessToken');
db.OAuthAuthorizationCode = require('./OAuthAuthorizationCode');
db.OAuthClient = require('./OAuthClient');
db.OAuthRefreshToken = require('./OAuthRefreshToken');
db.OAuthScope = require('./OAuthScope');
db.User = require('./User');
db.Thing = require('./Thing');

module.exports = db;