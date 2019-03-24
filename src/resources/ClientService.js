const Promise = require('bluebird');
const commons = require('developmentsoftware-api-commons');
const ModelAbstractService = commons.model;
let user = require('./UserService');
const uuidV4 = require('uuid/v4');

class ClientService extends ModelAbstractService {

    constructor(storage) {
        super('client', storage);
        this.primaryKey = 'clientId';
    }

    modelMap(data, index, array, model = {}) {


        console.log('client service', data, data.operatorId );
        return {
            name: data.name || model.name,
            clientId: data.clientId || model.clientId || uuidV4(),
            platformId: data.platformId || model.platformId,
            operatorId: data.operatorId || (typeof model === 'undefined' ? model.operatorId : 0),
            enabled: data.enabled || (typeof model === 'undefined' ? model.enabled : true),
            clientSecret: data.clientSecret || model.clientSecret,
            redirectUri: data.redirectUri || model.redirectUri || '',
            grantTypes: data.grantTypes || model.grantTypes,
            scope: data.scope || model.scope,
            user: data.user || (typeof model === 'undefined' ? model.user : null),
        }
    }

    find(query) {
        return new Promise((resolv, reject) => {
            super.find(query).then((results) => {
                let promises = [];
                results.forEach((e) => {
                    if (e.user === null) {
                        return promises.push(new Promise((r, j) => {
                            r(e);
                        }));
                    }
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