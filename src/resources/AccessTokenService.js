const Promise = require('bluebird');
const commons = require('developmentsoftware-api-commons');
const ModelAbstractService = commons.model;

class AccessTokenService extends ModelAbstractService {

    constructor(storage) {
        super('access_token', storage);
        this.primaryKey = 'accessToken';
    }

    modelMap(data, index, array, model) {
        return {
            accessToken: data.accessToken || model.accessToken,
            accessTokenExpiresAt: data.accessTokenExpiresAt || null,
            scope: data.scope || model.scope,
            user: data.user || model.user,
            client: data.client || model.client || null,
        }
    }
}

module.exports = new AccessTokenService(commons.storage);