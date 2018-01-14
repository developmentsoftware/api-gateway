const Promise = require('bluebird');
const commons = require('developmentsoftware-api-commons');
const ModelAbstractService = commons.model;

class RefreshTokenService extends ModelAbstractService {

    constructor(storage) {
        super('refreshToken', storage);
        this.primaryKey = 'refreshToken'
    }

    modelMap(data, model) {
        return {
            refreshToken: data.refreshToken || model.refreshToken,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt || model.refreshTokenExpiresAt,
            user: data.user || model.user,
            client: data.client || model.client,
            scope: data.scope || model.scope,
        }
    }

    destroy(object) {
        return true;
    }

}

module.exports = new RefreshTokenService(commons.storage);