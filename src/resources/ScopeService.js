const Promise = require('bluebird');
const commons = require('developmentsoftware-api-commons');
const ModelAbstractService = commons.model;

class ScopeService extends ModelAbstractService {

    constructor(storage) {
        super('scope', storage);
    }

    modelMap(data, model) {

        return {
            scope: data.scope || model.scope,
            is_default: data.is_default || model.is_default || null,
        }
    }
}

module.exports = new ScopeService(commons.storage);