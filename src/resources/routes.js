const express = require('express');
const client = require('./ClientService');
const user = require('./UserService');
const router = express.Router();



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
