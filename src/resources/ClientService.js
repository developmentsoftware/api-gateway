const Promise = require('bluebird');
const commons = require('developmentsoftware-api-commons');
const ModelAbstractService = commons.model;
let user = require('./UserService');

class ClientService extends ModelAbstractService {

    constructor(storage) {
        super('client', storage);
        this.primaryKey = 'clientId';
    }

    modelMap(data, model) {

        return {
            name: data.name || model.name,
            clientId: data.clientId || model.clientId,
            platformId: data.platformId || model.platformId,
            enabled: data.enabled || model.enabled,
            clientSecret: data.clientSecret || model.clientSecret,
            redirectUri: data.redirectUri || model.redirectUri || null,
            grantTypes: data.grantTypes || model.grantTypes,
            scope: data.scope || model.scope,
            user: data.user || model.user || null,
        }
    }

    find(query) {
        return new Promise((resolv, reject) => {
            super.find(query).then((results) => {
                let promises = [];
                results.forEach((e) => {
                    promises.push(new Promise((r, j) => {
                        user.get(e.user).then((user) => {
                            e.user = user;
                            r(e);
                        }).catch(j);
                    }));
                });
                Promise.all(promises).then(resolv).catch(reject);
            }).catch(reject);
        })
    }
}

module.exports = new ClientService(commons.storage);