let _ = require('lodash');
let mongodb = require('./mongodb');
let User = mongodb.User;
let OAuthClient = mongodb.OAuthClient;
let OAuthAccessToken = mongodb.OAuthAccessToken;
let OAuthAuthorizationCode = mongodb.OAuthAuthorizationCode;
let OAuthRefreshToken = mongodb.OAuthRefreshToken;

function getAccessToken(bearerToken) {
    console.log("getAccessToken", bearerToken);
    return OAuthAccessToken
        .findOne({access_token: bearerToken})
        .populate('User')
        .populate('OAuthClient')
        .then((accessToken) => {
            if (!accessToken) return false;
            let token = accessToken;
            token.user = token.User;
            token.client = token.OAuthClient;
            return token;
        })
        .catch((err) => {
            console.log("getAccessToken - Err: ", err);
        });
}

function getClient(clientId, clientSecret) {
    const options = {client_id: clientId};
    if (clientSecret) options.client_secret = clientSecret;

    return OAuthClient
        .findOne(options)
        .then((client) => {
            if (!client) return new Error("client not found");
            let clientWithGrants = client;
            clientWithGrants.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials'];
            // Todo: need to create another table for redirect URIs
            clientWithGrants.redirectUris = [clientWithGrants.redirect_uri];
            delete clientWithGrants.redirect_uri;
            return clientWithGrants;
        }).catch((err) => {
            console.log("getClient - Err: ", err);
        });
}


function getUser(username, password) {
    return User
        .findOne({username: username})
        .then((user) => {
            return user.password === password ? user : false;
        })
        .catch((err) => {
            console.log("getUser - Err: ", err);
        });
}

function revokeAuthorizationCode(code) {
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

function revokeToken(token) {
    console.log("revokeToken", token);
    return OAuthRefreshToken.findOne({
        where: {
            refresh_token: token.refreshToken
        }
    }).then((rT) => {
        if (rT) rT.destroy();
        let expiredToken = token;
        expiredToken.refreshTokenExpiresAt = new Date('2015-05-28T06:59:53.000Z');
        return expiredToken
    }).catch((err) => {
        console.log("revokeToken - Err: ", err)
    });
}


function saveToken(token, client, user) {
    return Promise.all([
        OAuthAccessToken.create({
            access_token: token.accessToken,
            expires: token.accessTokenExpiresAt,
            OAuthClient: client._id,
            User: user._id,
            scope: token.scope
        }),
        token.refreshToken ? OAuthRefreshToken.create({
            refresh_token: token.refreshToken,
            expires: token.refreshTokenExpiresAt,
            OAuthClient: client._id,
            User: user._id,
            scope: token.scope
        }) : [],

    ])
        .then((resultsArray) => {
            return _.assign(
                {
                    client: client,
                    user: user,
                    access_token: token.accessToken, // proxy
                    refresh_token: token.refreshToken, // proxy
                },
                token
            )
        })
        .catch((err) => {
            console.log("revokeToken - Err: ", err);
        });
}

function getAuthorizationCode(code) {
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

function saveAuthorizationCode(code, client, user) {
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

function getUserFromClient(client) {
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

function getRefreshToken(refreshToken) {
    if (!refreshToken || refreshToken === 'undefined') return false;
    return OAuthRefreshToken
        .findOne({refresh_token: refreshToken})
        .populate('User')
        .populate('OAuthClient')
        .then((savedRT) => {
            let tokenTemp = {
                user: savedRT ? savedRT.User : {},
                client: savedRT ? savedRT.OAuthClient : {},
                refreshTokenExpiresAt: savedRT ? new Date(savedRT.expires) : null,
                refreshToken: refreshToken,
                refresh_token: refreshToken,
                scope: savedRT.scope
            };
            return tokenTemp;

        }).catch((err) => {
            console.log("getRefreshToken - Err: ", err);
        });
}

function validateScope(token, client, scope) {
    return (user.scope === client.scope) ? scope : false
}

function verifyScope(token, scope) {
    return token.scope === scope
}
module.exports = {
    getAccessToken: getAccessToken,
    getAuthorizationCode: getAuthorizationCode,
    getClient: getClient,
    getRefreshToken: getRefreshToken,
    getUser: getUser,
    getUserFromClient: getUserFromClient,
    revokeAuthorizationCode: revokeAuthorizationCode,
    revokeToken: revokeToken,
    saveToken: saveToken,
    saveAuthorizationCode: saveAuthorizationCode,
    verifyScope: verifyScope,
};

