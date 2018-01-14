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
            clientSecret: data.clientSecret || model.clientSecret,
            redirectUri: data.redirectUri || model.redirectUri,
            grantTypes: data.grantTypes || model.grantTypes,
            scope: data.scope || model.scope,
            user: data.user || model.user || null,
        }
    }

    //mock

    find(query) {
        return new Promise((resolv, reject) => {
            resolv([
                {
                    name: 'saraza',
                    clientId: 123457,
                    clientSecret: 'holahola',
                    redirectUri:'localhost.com/login',
                    grantTypes: ['password'],
                    scope: [],
                    user: user.find({username:'meme'}),
                }
            ])
        })
    }
}

module.exports = new ClientService(commons.storage);