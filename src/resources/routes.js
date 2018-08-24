const express = require('express');
const client = require('./ClientService');
const user = require('./UserService');
const accessToken = require('./AccessTokenService');
const refreshToken = require('./RefreshTokenService');
const router = express.Router();
const secret = process.env.SECRET || 'secret';

/* GET tokens listing. */
router.get('/oauth/tokens/', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    accessToken.all()
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* Get token. */
router.get('/oauth/tokens/:token', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    accessToken.get(req.params.token)
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* Remove token. */
router.delete('/oauth/tokens/:token', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    accessToken.delete(req.params.token)
        .then(() => {
            res.status(204);
            res.json('');
        })
        .catch(next);
});

/* GET tokens listing. */
router.get('/oauth/refresh_tokens/', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    refreshToken.all()
        .then(data => {
            res.json(data);
        })
        .catch(next);
});
/* Get token. */
router.get('/oauth/refresh_tokens/:token', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    refreshToken.get(req.params.token)
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* Remove token. */
router.delete('/oauth/refresh_tokens/:token', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    refreshToken.delete(req.params.token)
        .then(() => {
            res.status(204);
            res.json('');
        })
        .catch(next);
});

/* GET users listing. */
router.get('/oauth/users/', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    user.all()
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* POST user create. */
router.post('/oauth/users/', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    user.create(req.body)
        .then(data => {
            res.status(201);
            res.json(data);
        })
        .catch(next);
});

/* GET user details. */
router.get('/oauth/users/:id', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    user.get(req.params.id)
        .then(data => {
            res.json(data);
        })
        .catch(next);
});


/* GET user details. */
router.delete('/oauth/users/:id', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    user.delete(req.params.id)
        .then(() => {
            res.status(204);
            res.json();
        })
        .catch(next);
});

/* PUT/PATCH user update. */
router.put('/oauth/users/:id', userUpdate);
router.patch('/oauth/users/:id', userUpdate);

function userUpdate(req, res, next) {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    user.update(req.params.id, req.body)
        .then(data => {
            res.json(data);
        })
        .catch((er) => {
            console.log(er);
            next(er);
        });
}

/* GET clients listing. */
router.get('/oauth/clients/', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    client.all()
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* POST client create. */
router.post('/oauth/clients/', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    client.create(req.body)
        .then(data => {
            res.status(201);
            res.json(data);
        })
        .catch(next);
});

/* GET client details. */
router.get('/oauth/clients/:id', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    client.get(req.params.id)
        .then(data => {
            res.json(data);
        })
        .catch(next);
});

/* GET client details. */
router.delete('/oauth/clients/:id', (req, res, next) => {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    client.delete(req.params.id)
        .then(() => {
            res.status(204);
            res.json();
        })
        .catch(next);
});

/* PUT/PATCH client update. */
router.put('/oauth/clients/:id', clientUpdate);
router.patch('/oauth/clients/:id', clientUpdate);

function clientUpdate(req, res, next) {
    if (!req.headers['x-http-secret'] || req.headers['x-http-secret'] !== secret) {
        return next({
            code: 400,
            message: 'Bad Request'
        });
    }
    client.update(req.params.id, req.body)
        .then(data => {
            res.json(data);
        })
        .catch(next);
}

module.exports = router;
