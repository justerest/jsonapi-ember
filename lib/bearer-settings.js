const bearer = require('bearer'),
    configMySQL = require('./confmysql.js'),
    mysql = require('mysql'),
    connection = mysql.createConnection(configMySQL.forMySQLconnect),
    moment = require('moment');

module.exports = function (app) {
    bearer({ //Make sure to pass in the app (express) object so we can set routes
        app: app,
        //Please change server key for your own safety!
        serverKey: configMySQL.bearer,
        tokenUrl: '/api/oauth2', //Call this URL to get your token. Accepts only POST method
        extendTokenUrl: '/api/extendtoken', //Call this URL to get your token. Accepts only POST method
        cookieName: 'x-auth', //default name for getting token from cookie when not found in Authorization header
        createToken: function (req, next, cancel) {
            //If your user is not valid just return "underfined" from this method.
            //Your token will be added to req object and you can use it from any method later
            var username = req.body.username;
            var password = req.body.password;
            //You get the idea how to use next and cancel callbacks, right?
            connection.query('SELECT * FROM `users` WHERE `username` LIKE "' + username + '"', function (err, rows) {
                if (!err && rows[0]) {
                    if (rows[0].password == password) {
                        next({
                            expire: moment(Date.now()).add(1, 'months').format('YYYY-MM-DD HH:mm:ss'),
                            username: username,
                            contentType: req.get('Content-Type'),
                            ip: req.ip,
                            userAgent: req.header('user-agent'),
                            custom_id: rows[0].id,
                            another: '',
                            moreData: ''
                        });
                    } else {
                        cancel({
                            code: 1000,
                            message: 'I do not like you'
                        });
                    }
                } else {
                    cancel({
                        code: 1000,
                        message: 'I do not like you'
                    });
                }
            });
        },
        extendToken: function (req, next, cancel) {
            var token = req.authToken;
            if (token) {
                next({
                    expire: moment(Date.now()).add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
                    username: token.username,
                    contentType: req.get('Content-Type'),
                    ip: req.ip,
                    userAgent: req.header('user-agent'),
                    custom_id: token.custom_id,
                    another: '',
                    moreData: ''
                });
            } else {
                cancel();
            }
        },
        validateToken: function (req, token) {
            //you could also check if request came from same IP using req.ip==token.ip for example
            if (req.ip == token.ip) {
                return moment(token.expire) > moment(new Date());
            }
            return false;
        },
        onTokenValid: function (token, next, cancel) {
            //This is in case you would like to check user account status in DB each time he attempts to do something.
            //Doing this will affect your performance but its your choice if you really need it
            //Returning false from this method will reject user even if his token is OK
            //var username = token.username;

            if (true) {
                next()
            } else {
                cancel();
            }
        },
        userInRole: function (token, roles, next, cancel) {
            //Provide role level access restrictions on url
            //You can use onTokenValid for this also, but I find this easier to read later
            //If you specified "roles" property for any secureRoute below, you must implement this method
            connection.query('SELECT * FROM `users` WHERE `id` LIKE ' + token.custom_id + ' AND `roles` LIKE "' + roles + '"', function (err, rows) {
                let id = rows[0] ? rows[0].id : 'not';
                if (!err && id == token.custom_id) {
                    next();
                } else {
                    cancel();
                }
            });
        },
        onAuthorized: function (req, token, res) {
            //console.log("this will be executed if request is OK");
        },
        onUnauthorized: function (req, token, res, errorMessage) {
            //      console.log(req.path, "this will be executed if request fails authentication");
            res.send({
                error: errorMessage
            });
        },
        secureRoutes: []
    });
}
