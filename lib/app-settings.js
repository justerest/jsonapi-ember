const bodyParser = require('body-parser'),
    compression = require('compression'),
    config = require('./config.js');

module.exports = function (app) {
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    // Add headers
    app.use(function (req, res, next) {
        // Website you wish to allow to connect --- Почему-то не работает
        res.setHeader('Access-Control-Allow-Origin', '*'); //'https://' + config.host
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        // Pass to next layer of middleware
        next();
    });
    //Сжатие
    app.use(compression());
}
