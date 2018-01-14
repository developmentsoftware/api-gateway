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
        .catch(() => {
            return false;
        });
}

function getClient(clientId, clientSecret) {
    let query = {clientId: clientId};
    if (clientSecret) query.client_secret = clientSecret;
    return client.find(query)
        .then((results) => {
            if (results < 1) return false;
            let result = results[0];
            result.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials'];
            result.redirectUris = [result.redirect_uri];
            delete result.redirect_uri;
            return result;
        })
        .catch(() => {
            return false;
        });
}

function getUser(username, password) {
    return user
        .get(username)
        .then((result) => {
            if (!result) return false;
            return result.password === password ? result : false;
        })
        .catch(() => {
            return false;
        });
}

function revokeToken(token) {
    return refreshToken.get(token.refreshToken).then((rT) => {
        if (rT) refreshToken.destroy(rT);
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
            client: client,
            user: user,
            scope: token.scope
        }),
        token.refreshToken ? refreshToken.create({
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            client: client,
            user: user,
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

        }).catch(() => {
            return false;
        });
}

function verifyScope(token, scope) {
    return token.scope === scope
}

function getUserFromClient(object) {
    let query = {client_id: object.client_id};
    if (query.client_secret) query.client_secret = object.client_secret;
    return client.find(query)
        .then((results) => {
            if (results < 1) return false;
            let result = results[0];
            if (!result.user) return false;
            return result.user;
        }).catch((err) => {
            console.log("getUserFromClient - Err: ", err);
            return false;
        });
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

 function _getUserFromClient(client) {
 let options = {client_id: client.client_id};
 if (client.client_secret) options.client_secret = client.client_secret;

 return OAuthClient
 .findOne(options)
 .populate('User')
 .then((client) => {
 if (!client) return false;
 if (!client.User) return false;
 return client.User;
 }).catch((err) => {
 console.log("getUserFromClient - Err: ", err);
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

