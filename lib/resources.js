const RelationalDbStore = require("jsonapi-store-relationaldb"),
    config = require('./config.js');

module.exports = function (jsonApi) {
    jsonApi.define({
        resource: "bonuscards",
        handlers: new RelationalDbStore(config.forJsonApi),
        attributes: {
            company: jsonApi.Joi.one('companies'),
            text: jsonApi.Joi.string(),
            image: jsonApi.Joi.string()
        }
    });
    jsonApi.define({
        resource: "events",
        handlers: new RelationalDbStore(config.forJsonApi),
        attributes: {
            name: jsonApi.Joi.string(),
            title: jsonApi.Joi.string(),
            info: jsonApi.Joi.string(),
            time: jsonApi.Joi.number(),
            cost: jsonApi.Joi.string(),
            pay: jsonApi.Joi.string(),
            address: jsonApi.Joi.string(),
            phone: jsonApi.Joi.string(),
            website: jsonApi.Joi.string(),
            expiredate: jsonApi.Joi.number(),
            enabled: jsonApi.Joi.number(),
            company: jsonApi.Joi.one('companies'),
            user: jsonApi.Joi.one('users'),
            firstimage: jsonApi.Joi.string(),
            secondimage: jsonApi.Joi.string()
        }
    });
    jsonApi.define({
        resource: "options",
        handlers: new RelationalDbStore(config.forJsonApi),
        attributes: {
            name: jsonApi.Joi.string(),
            text: jsonApi.Joi.string(),
            children: jsonApi.Joi.belongsToMany({
                resource: "options",
                as: "parent"
            }),
            parent: jsonApi.Joi.one('options')
        }
    });
    jsonApi.define({
        resource: "balances",
        handlers: new RelationalDbStore(config.forJsonApi),
        attributes: {
            money: jsonApi.Joi.number(),
            user: jsonApi.Joi.one('users')
        }
    });
    jsonApi.define({
        resource: "notetypes",
        handlers: new RelationalDbStore(config.forJsonApi),
        attributes: {
            name: jsonApi.Joi.string(),
            category: jsonApi.Joi.string(),
            children: jsonApi.Joi.belongsToMany({
                resource: "notetypes",
                as: "parent"
            }),
            parent: jsonApi.Joi.one('notetypes'),
            companies: jsonApi.Joi.belongsToMany({
                resource: 'companies',
                as: 'class'
            })
        }
    });
    jsonApi.define({
        resource: "gallaries",
        handlers: new RelationalDbStore(config.forJsonApi),
        attributes: {
            name: jsonApi.Joi.string(),
            images: jsonApi.Joi.belongsToMany({
                resource: "images",
                as: "gallary"
            }),
            company: jsonApi.Joi.one('companies'),
            max: jsonApi.Joi.number()
        }
    });
    jsonApi.define({
        resource: "images",
        handlers: new RelationalDbStore(config.forJsonApi),
        attributes: {
            path: jsonApi.Joi.string(),
            typeimage: jsonApi.Joi.string(),
            user: jsonApi.Joi.one('users'),
            gallary: jsonApi.Joi.one('gallaries')
        }
    });
    jsonApi.define({
        resource: "companies",
        handlers: new RelationalDbStore(config.forJsonApi),
        attributes: {
            name: jsonApi.Joi.string(),
            class: jsonApi.Joi.one('notetypes'),
            logo: jsonApi.Joi.string(),
            thumb: jsonApi.Joi.string(),
            info: jsonApi.Joi.string(),
            about: jsonApi.Joi.string(),
            address: jsonApi.Joi.string(),
            phone: jsonApi.Joi.string(),
            worktime: jsonApi.Joi.string(),
            website: jsonApi.Joi.string(),
            vk: jsonApi.Joi.string(),
            odnoklassniki: jsonApi.Joi.string(),
            facebook: jsonApi.Joi.string(),
            instagram: jsonApi.Joi.string(),
            youtube: jsonApi.Joi.string(),
            owner: jsonApi.Joi.one('users'),
            gallaries: jsonApi.Joi.belongsToMany({
                resource: "gallaries",
                as: "company"
            }),
            events: jsonApi.Joi.belongsToMany({
                resource: "events",
                as: "company"
            }),
            enabled: jsonApi.Joi.number(),
            expiredate: jsonApi.Joi.number(),
            lefttext: jsonApi.Joi.string(),
            bonuscard: jsonApi.Joi.one('bonuscards')
        }
    });
    const chainHandler = new jsonApi.ChainHandler();
    chainHandler.afterSearch = function (request, results, pagination, callback) {
        for (let i = 0; i < results.length; i++) {
            delete results[i].password;
        }
        return callback(null, results, pagination);
    };
    chainHandler.afterFind = (request, results, callback) => {
        delete results.password;
        return callback(null, results);
    }
    jsonApi.define({
        resource: "users",
        handlers: chainHandler.chain(new RelationalDbStore(config.forJsonApi)),
        attributes: {
            username: jsonApi.Joi.string(),
            password: jsonApi.Joi.string(),
            fullname: jsonApi.Joi.string(),
            roles: jsonApi.Joi.string(),
            phone: jsonApi.Joi.string(),
            email: jsonApi.Joi.string(),
            companies: jsonApi.Joi.belongsToMany({
                resource: "companies",
                as: "owner"
            }),
            images: jsonApi.Joi.belongsToMany({
                resource: "images",
                as: "user"
            }),
            events: jsonApi.Joi.belongsToMany({
                resource: "events",
                as: "user"
            }),
            balance: jsonApi.Joi.one('balances')
        }
    });
    const shemy = jsonApi._resources;
    for (let key in shemy) {
        for (let key2 in shemy[key]['attributes']) {
            shemy[key]['attributes'][key2] = shemy[key]['attributes'][key2].allow(null);
        }
        for (let key2 in shemy[key]['onCreate']) {
            shemy[key]['onCreate'][key2] = shemy[key]['onCreate'][key2].allow(null);
        }
    }
}
