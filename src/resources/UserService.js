const Promise = require('bluebird');
const commons = require('developmentsoftware-api-commons');
const ModelAbstractService = commons.model;
const uuidV4 = require('uuid/v4');

class UserService extends ModelAbstractService {

    constructor(storage) {
        super('user', storage);
        this.primaryKey = 'userId';
    }

    modelMap(data, index, array,  model) {
        return {
            userId: data.userId || model.userId || uuidV4(),
            platformId: data.platformId || model.platformId,
            operatorId: data.operatorId || ((typeof model !== 'undefined') ? model.operatorId : 0),
            enabled: data.enabled || ((typeof model !== 'undefined') ? model.enabled : false),
            username: data.username || model.username,
            password: data.password || model.password,
            roles: data.roles || ((typeof model !== 'undefined') ? model.roles : []),
            scope: data.scope || ((typeof model !== 'undefined') ? model.scope : 'user'),
        }
    }

    create(data) {
        return new Promise((resolv, reject) => {
            this.find({username: data.username, platformId: data.platformId, operatorId: data.operatorId || null})
                .then(result => {
                    if(result.length <=0 ){
                        return this.bulkCreate([data])
                            .then(data => {
                                resolv(data[0])
                            })
                            .catch(reject);
                    }
                    reject({
                        statusCode: 400,
                        message: `Bad Request - Has one username (${data.username}) in this platform (${data.platformId})`
                    });
                })
                .catch(reject);
        });

    }
}

module.exports = new UserService(commons.storage);