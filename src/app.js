let express = require('express');
let logger = require('morgan');
let bodyParser = require('body-parser');
let oauthServer = require('oauth2-server');
let Request = oauthServer.Request;
let Response = oauthServer.Response;
let routes = require('./resources/routes');

let app = express();


app.use(logger('dev'));

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
    accessTokenLifetime: 60 * 60,             // 1 hour.
    refreshTokenLifetime: 60 * 60 * 24 * 14,  // 2 weeks.
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
                "expires_in": 3600,
            })
        }).catch((err) => {
        console.log(err);
        return res.status(err.code).json(err)
    });
});

/* add crud and additional routes */
app.use(routes);

/*  Magic of the api gateway */
app.get('/', (req, res) => {
    app.oauth.authenticate(req.oauth, res.oauth)
        .then(() => {
            res.send('Secret area');
        })
        .catch((err) => {
            return res.status(err.code).json(err)
        });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : '';
    console.log(err);
    // render the error page
    res.status(err.statusCode || 500);
    res.json({'code': err.statusCode || err.code || 500,'error': err.message});
});

module.exports = app;
