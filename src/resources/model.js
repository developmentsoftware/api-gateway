let _ = require('lodash');
let user = require('./UserService');
let client = require('./ClientService');
let accessToken = require('./AccessTokenService');
let refreshToken = require('./RefreshTokenService');
let authorizationCode = require('./AuthorizationCodeService'); //@todo aun no implentado

function getAccessToken(bearerToken) {
    return accessToken
        .get(bearerToken)
        .then((result) => {
            return (!result) ? false : result;
        })
        .catch((e) => {
            return false;
        });
}

function getClient(clientId, clientSecret) {
    let query = {clientId: clientId};
    if (clientSecret) query.clientSecret = clientSecret;
    return client.find(query)
        .then((results) => {
            if (results < 1) return false;
            let result = results[0];
            result.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials'];
            result.redirectUris = [result.redirectUri];
            delete result.redirectUri;
            return result;
        })
        .catch((err) => {
            console.log(err);
            return false;
        });
}

function getUser(username, password, client) {
    return user
        .find({username: username, platformId: client.platformId})
        .then((result) => {
            if (!result[0]) return false;
            return result[0].password === password && result[0].enabled && client.enabled ? result[0] : false;
        })
        .catch(() => {
            return false;
        });
}

function revokeToken(token) {
    return refreshToken.get(token.refreshToken).then((rT) => {
        if (rT) refreshToken.delete(rT.refreshToken);
        let expiredToken = token;
        expiredToken.refreshTokenExpiresAt = new Date('2015-05-28T06:59:53.000Z');
        return expiredToken;
    }).catch(() => {
        return false;
    });
}

function saveToken(token, client, user) {
    return Promise.all([
        accessToken.create({
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            client: client.clientId,
            user: user.userId,
            scope: token.scope
        }),
        token.refreshToken ? refreshToken.create({
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            client: client.clientId,
            user: user.userId,
            scope: token.scope
        }) : [],

    ])
        .then(() => {
            return _.assign(
                {
                    client: client,
                    user: user,
                    access_token: token.accessToken,
                    refresh_token: token.refreshToken,
                },
                token
            )
        })
        .catch(() => {
            return false;
        });
}

function getRefreshToken(token) {
    if (!token || token === 'undefined') return false;
    return refreshToken
        .get(token)
        .then((result) => {
            if (!result) return false;
            result.refreshTokenExpiresAt = result.refreshTokenExpiresAt ? new Date(result.expires) : null;
            result.refresh_token = result.refreshToken;
            return result;
        }).catch((err) => {
            return false;
        });
}

function verifyScope(token, scope) {
    return token.scope === scope
}

function getUserFromClient(object) {
    let query = {client_id: object.client_id};
    if (query.client_secret) query.client_secret = object.client_secret;
    return object.user;
}

/*
 function _getAuthorizationCode(code) {
 return OAuthAuthorizationCode
 .findOne({authorization_code: code})
 .populate('User')
 .populate('OAuthClient')
 .then((authCodeModel) => {
 if (!authCodeModel) return false;
 let client = authCodeModel.OAuthClient;
 let user = authCodeModel.User;
 return reCode = {
 code: code,
 client: client,
 expiresAt: authCodeModel.expires,
 redirectUri: client.redirect_uri,
 user: user,
 scope: authCodeModel.scope,
 };
 }).catch((err) => {
 console.log("getAuthorizationCode - Err: ", err);
 });
 }

 function _saveAuthorizationCode(code, client, user) {
 return OAuthAuthorizationCode
 .create({
 expires: code.expiresAt,
 OAuthClient: client._id,
 authorization_code: code.authorizationCode,
 User: user._id,
 scope: code.scope
 })
 .then(() => {
 code.code = code.authorizationCode;
 return code
 }).catch((err) => {
 console.log("saveAuthorizationCode - Err: ", err)
 });
 }

 function _revokeAuthorizationCode(code) {
 console.log("revokeAuthorizationCode", code);
 return OAuthAuthorizationCode.findOne({
 where: {
 authorization_code: code.code
 }
 }).then(() => {
 let expiredCode = code;
 expiredCode.expiresAt = new Date('2015-05-28T06:59:53.000Z');
 return expiredCode;
 }).catch((err) => {
 console.log("getUser - Err: ", err)
 });
 }

 function validateScope(token, client, scope) {
 return (user.scope === client.scope) ? scope : false
 }
 */

module.exports = {
    getAccessToken: getAccessToken,
    getClient: getClient,
    getRefreshToken: getRefreshToken,
    getUser: getUser,
    revokeToken: revokeToken,
    saveToken: saveToken,
    verifyScope: verifyScope,
    getUserFromClient: getUserFromClient,
    // getAuthorizationCode: getAuthorizationCode,
    // saveAuthorizationCode: saveAuthorizationCode,
    // revokeAuthorizationCode: revokeAuthorizationCode,
};

