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
            userId: data.userId || model.userId,
            platformId: data.platformId || model.platformId,
            enabled: data.enabled || model.enabled || true,
            username: data.username || model.username,
            password: data.password || model.password,
            scope: data.scope || model.scope || 'user',
        }
    }
}

module.exports = new UserService(commons.storage);