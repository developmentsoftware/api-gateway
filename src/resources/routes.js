const express = require('express');
const client = require('./ClientService');
const user = require('./UserService');
const accessToken = require('./AccessTokenService');
const refreshToken = require('./RefreshTokenService');
const router = express.Router();

/* GET tokens listing. */
router.get('/oauth/tokens/', (req, res, next) => {
    accessToken.all()
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* Get token. */
router.get('/oauth/tokens/:token', (req, res, next) => {
    accessToken.get(req.params.token)
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* Remove token. */
router.delete('/oauth/tokens/:token', (req, res, next) => {
    accessToken.delete(req.params.token)
        .then(() => {
            res.status(204);
            res.json('');
        })
        .catch(next);
});

/* GET tokens listing. */
router.get('/oauth/refresh_tokens/', (req, res, next) => {
    refreshToken.all()
        .then(data => {
            res.json(data);
        })
        .catch(next);
});
/* Get token. */
router.get('/oauth/refresh_tokens/:token', (req, res, next) => {
    refreshToken.get(req.params.token)
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* Remove token. */
router.delete('/oauth/refresh_tokens/:token', (req, res, next) => {
    refreshToken.delete(req.params.token)
        .then(() => {
            res.status(204);
            res.json('');
        })
        .catch(next);
});

/* GET users listing. */
router.get('/oauth/user/', (req, res, next) => {
    user.all()
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* POST user create. */
router.post('/oauth/user/', (req, res, next) => {
    user.create(req.body)
        .then(data => {
            res.status(201);
            res.json(data);
        })
        .catch(next);
});

/* GET user details. */
router.get('/oauth/user/:id', (req, res, next) => {
    user.get(req.params.id)
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* PUT/PATCH user update. */
router.put('/oauth/user/:id', userUpdate);
router.patch('/oauth/user/:id', userUpdate);

function userUpdate(req, res, next) {
    client.update(req.params.id, req.body)
        .then(data => {
            res.json(data);
        })
        .catch(next);
}

/* GET clients listing. */
router.get('/oauth/client/', (req, res, next) => {
    client.all()
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* POST client create. */
router.post('/oauth/client/', (req, res, next) => {
    client.create(req.body)
        .then(data => {
            res.status(201);
            res.json(data);
        })
        .catch(next);
});

/* GET client details. */
router.get('/oauth/client/:id', (req, res, next) => {
    client.get(req.params.id)
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* PUT/PATCH client update. */
router.put('/oauth/client/:id', clientUpdate);
router.patch('/oauth/client/:id', clientUpdate);

function clientUpdate(req, res, next) {
    client.update(req.params.id, req.body)
        .then(data => {
            res.json(data);
        })
        .catch(next);
}

module.exports = router;
