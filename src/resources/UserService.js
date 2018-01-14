const Promise = require('bluebird');
const commons = require('developmentsoftware-api-commons');
const ModelAbstractService = commons.model;

class UserService extends ModelAbstractService {

    constructor(storage) {
        super('user', storage);
        this.primaryKey = 'username';
    }

    modelMap(data, model) {

        return {
            user_id: data.user_id || model.user_id,
            username: data.name || model.name,
            password: data.client_id || model.client_id,
            scope: data.scope || model.scope,
        }
    }

    //mock

    find(query) {
        return new Promise((resolv, reject) => {
            resolv([
                {
                    user_id: '124125125',
                    username: query.username,
                    password: 'cocomelo',
                    scope: [],
                }
            ])
        })
    }
}

module.exports = new UserService(commons.storage);