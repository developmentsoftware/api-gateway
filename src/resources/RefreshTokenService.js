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

        console.log("data", data,"model", model);
        console.log("data.user", data.user);
        return {
            refreshToken: data.refreshToken? data.refreshToken : model !== undefined ? model.refreshToken : null,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt? data.refreshTokenExpiresAt :  model !== undefined ? model.refreshTokenExpiresAt : null,
            user: data.user? data.user : model !== undefined ? model.user : null,
            client: data.client? data.client : model !== undefined ? model.client : null,
            scope: data.scope? data.scope : model !== undefined ? model.scope: null,
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