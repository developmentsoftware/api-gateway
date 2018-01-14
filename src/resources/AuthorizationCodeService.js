const Promise = require('bluebird');
const commons = require('developmentsoftware-api-commons');
const ModelAbstractService = commons.model;

class AuthorizationCodeService extends ModelAbstractService {

    constructor(storage) {
        super('authorizationCode', storage);
    }

    modelMap(data, model) {

        return {
            authorizationCode: data.access_token || model.access_token,
            authorizationCodeExpiresAt: data.authorizationCodeExpiresAt || model.authorizationCodeExpiresAt,
            redirectUri: data.redirectUri || model.redirectUri,
            scope: data.scope || model.scope,
            user: data.user || model.user,
            client: data.client || model.client || null,
        }
    }
}

module.exports = new AuthorizationCodeService(commons.storage);