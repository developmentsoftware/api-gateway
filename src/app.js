const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;
const routes = require('./resources/routes');
const proxy = require('express-http-proxy');

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

function getService(collection, req) {

    const path = Object.keys(collection).find((path) => {
        const patt = new RegExp(`^${path}/?$`);
        return patt.test(req.path);
    });

    if (!path || !collection[path][req.method]) {
        return false;
    }
    return collection[path][req.method];
}

/*  Magic of the api gateway */
app.use((req, res, next) => {
    const service = getService(anonymous, req);
    if (false === service) {
        return next();
    }
    const newUrl = `${req.protocol}://${req.hostname}`;
    const regex = new RegExp(`http:\\\\\\/\\\\\\/${service}`, 'g');
    const target = `http://${service}${req.url}`;
    proxy(target, {
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
            return proxyResData.toString('utf8').replace(regex, newUrl);
        },
        userResHeaderDecorator: (headersRes, userReq, userRes, proxyReq, proxyRes) => {
            for (let header in headers) headersRes[header] = headers[header];
            return headersRes;
        }
    })(req, res, next);
});


/*  Magic of the api gateway */
app.use((req, res, next) => {
    const service = getService(authenticated, req);
    if (false === service) {
        return next();
    }
    const newUrl = `${req.protocol}://${req.hostname}`;
    const regex = new RegExp(`http:\\\\\\/\\\\\\/${service}`, 'g');
    const target = `http://${service}${req.url}`;
    app.oauth.authenticate(req.oauth, res.oauth)
        .then((accessToken) => {
            user.get(accessToken.user).then((u) => {
                req.headers['x-http-user-id'] = u.userId;
                req.headers['x-http-platform-id'] = u.platformId;
                proxy(target, {
                    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
                        return proxyResData.toString('utf8').replace(regex, newUrl);
                    },
                    userResHeaderDecorator: (headersRes, userReq, userRes, proxyReq, proxyRes) => {
                        for (let header in headers) headersRes[header] = headers[header];
                        return headersRes;
                    }
                })(req, res, next);
            }).catch((err) => {
                return next(err);
            });
        })
        .catch((err) => {
            return next(err);
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
    if (req.app.get('env') === 'development') {
        console.log(err);
    }
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