const Promise = require('bluebird');
const commons = require('developmentsoftware-api-commons');
const user = require('./UserService');
const client = require('./ClientService');
const ModelAbstractService = commons.model;

class RefreshTokenService extends ModelAbstractService {

    constructor(storage) {
        super('refreshToken', storage);
        this.primaryKey = 'refreshToken'
    }

    modelMap(data, index, array, model) {
        return {
            refreshToken: data.refreshToken || model.refreshToken,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt || model.refreshTokenExpiresAt,
            user: data.user || model.user,
            client: data.client || model.client,
            scope: data.scope || model.scope,
        }
    }

    get(value) {
        /** @var Promise refreshToken **/
        return new Promise((resolv, reject) => {
            let refreshToken = super.get(value);
            refreshToken
                .then((token) => {
                    new Promise.all([
                        client.get(token.client),
                        user.get(token.user),
                    ])
                        .then((resultArray) => {
                            token.client = resultArray[0];
                            token.user = resultArray[1];
                            resolv(token);
                        })
                        .catch((err)=>{
                            err;
                            reject(err);
                        });
                })
                .catch(reject)
        });
    }

}

module.exports = new RefreshTokenService(commons.storage);