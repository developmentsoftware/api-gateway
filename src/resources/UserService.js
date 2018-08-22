const Promise = require('bluebird');
const commons = require('developmentsoftware-api-commons');
const ModelAbstractService = commons.model;
const uuidV4 = require('uuid/v4');

class UserService extends ModelAbstractService {

    constructor(storage) {
        super('user', storage);
        this.primaryKey = 'userId';
    }

    modelMap(data, model) {

        return {
            userId: data.userId || model.userId || uuidV4(),
            platformId: data.platformId || model.platformId,
            enabled: data.enabled || model.enabled || true,
            username: data.username || model.username,
            password: data.password || model.password,
            scope: data.scope || model.scope || 'user',
        }
    }

    create(data) {
        return new Promise((resolv, reject) => {
            this.find({username: data.username, platformId: data.platformId})
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
                        message: 'Bad Request'
                    });
                })
                .catch(reject);
        });

    }
}

module.exports = new UserService(commons.storage);