const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;
const routes = require('./resources/routes');
const proxy = require('http-proxy-stream');
const cors = require('cors');
const fs = require('fs');
const user = require('./resources/UserService');

const configFolder = './config/';
const headers = readHeaders();
const anonymous = readAnonymous();
const authenticated = readauthenticated();

const accessTokenTTL = parseInt(process.env.ACCESS_TOKEN_TTL);
const refreshTokenTTL = parseInt(process.env.REFRESH_TOKEN_TTL);

let app = express();

app.use(logger('dev'));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    req.oauth = new Request(req);
    res.oauth = new Response(res);
    next();
});

app.oauth = new oauthServer({
    model: require('./resources/model'),
    grants: ['password'],
    accessTokenLifetime: accessTokenTTL,
    refreshTokenLifetime: refreshTokenTTL,
    debug: true
});

/* Oauth endpoint */
app.all('/oauth/token', (req, res, next) => {
    app.oauth
        .token(req.oauth, res.oauth)
        .then((token) => {
            return res.json({
                "access_token": token.accessToken,
                "refresh_token": token.refreshToken,
                "token_type": 'bearer',
                "expires_in": accessTokenTTL,
            })
        }).catch((err) => {
        return res.status(err.code).json(err)
    });
});

/* add crud and additional routes */
app.use(routes);

/*  Magic of the api gateway */
app.use((req, res, next) => {

    if (!anonymous[req.path] || !anonymous[req.path][req.method]) {
        return next();
    }

    proxy(req, {
        url: `http://${anonymous[req.path][req.method]}/${req.url}`,
        onResponse(response) {
            for (header in headers) {
                response.headers[header] = headers[header];
            }
        }
    }, res).catch((err) => {
        return res.status(err.code).json(err)
    });
});

/*  Magic of the api gateway */
app.use((req, res, next) => {

    if (!authenticated[req.path] || !authenticated[req.path][req.method]) {
        return next();
    }

    app.oauth.authenticate(req.oauth, res.oauth)
        .then((accessToken) => {
            user.get(accessToken.user).then((u) => {
                req.headers['x-http-user-id'] = u.userId;
                req.headers['x-http-platform-id'] = u.platformId;
                proxy(req, {
                    url: `http://${authenticated[req.path][req.method]}/${req.url}`,
                    onResponse(response) {
                        for (header in headers) {
                            response.headers[header] = headers[header];
                        }
                    }
                }, res)
            }).catch((err) => {
                return res.status(err.code).json(err)
            });
        })
        .catch((err) => {
            return res.status(err.code).json(err)
        });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.statusCode = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : '';
    // render the error page
    res.status(err.statusCode || err.status || 500);
    res.json({'code': err.statusCode || err.status || err.code || 500, 'error': err.message});
});

module.exports = app;


function readHeaders() {
    return JSON.parse(fs.readFileSync(`${configFolder}headers/default.json`, 'utf8'));
}

function readAnonymous() {
    return JSON.parse(fs.readFileSync(`${configFolder}anonymous/default.json`, 'utf8'));
}

function readauthenticated() {
    return JSON.parse(fs.readFileSync(`${configFolder}authenticated/default.json`, 'utf8'));
}