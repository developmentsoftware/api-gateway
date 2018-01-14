'use strict';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let OAuthScopeSchema = new Schema({
    scope: String,
    is_default: Boolean
});

module.exports = mongoose.model('OAuthScope', OAuthScopeSchema);
