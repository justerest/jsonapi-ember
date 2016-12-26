var jsonApi = require("jsonapi-server");
var RelationalDbStore = require("jsonapi-store-relationaldb");
var Joi = require("joi");
var app = jsonApi.getExpressServer();
var bodyParser = require('body-parser');
var moment = require('moment');
var bearer = require('bearer');
var mysql = require('mysql');
var async = require("async");
var connection = mysql.createConnection({
    host: 'kscript.ru',
    user: 'kamertonmu_ks',
    password: 'arurU75v',
    database: 'kamertonmu_kscript'
});
var instances = [];

let dbStore = new RelationalDbStore({
    dialect: "mysql",
    host: "kscript.ru",
    port: 3306,
    database: "kamertonmu_kscript", // If not provided, defaults to the name of the resource
    username: "kamertonmu_ks",
    password: "arurU75v",
    logging: false
});
let dbStore2 = new RelationalDbStore({
    dialect: "mysql",
    host: "kscript.ru",
    port: 3306,
    database: "kamertonmu_kscript", // If not provided, defaults to the name of the resource
    username: "kamertonmu_ks",
    password: "arurU75v",
    logging: false
});
instances.push(dbStore);
instances.push(dbStore2);

jsonApi.setConfig({
    port: 80,
    graphiql: false,
    base: 'api'
});

jsonApi.define({
    resource: "notes",
    handlers: dbStore,
    attributes: {
        title: jsonApi.Joi.string(),
        content: jsonApi.Joi.string(),
        author: jsonApi.Joi.one('users')
    }
});
jsonApi.define({
    resource: "users",
    handlers: dbStore2,
    attributes: {
        username: jsonApi.Joi.string(),
        password: jsonApi.Joi.string(),
        notes: jsonApi.Joi.belongsToMany({
            resource: "notes",
            as: "author"
        })
    }
});

//app.use(bodyParser());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

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

bearer({
    //Make sure to pass in the app (express) object so we can set routes
    app: app,
    //Please change server key for your own safety!
    serverKey: "bv7oY7on$HM_0*&RG2PSCDKJCAJ83jdf",
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
        connection.query('SELECT * FROM `users` WHERE `id` = ' + token.custom_id + ' AND `roles` LIKE "' + roles + '"', function (err, rows) {
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
    secureRoutes: [{
            url: '/api/users/auth',
            method: 'get',
            //roles: 'admin'
      } //any action under /secure route but NOT default "/secure" route
    ]
});



//==============================================================================
//Routing
app.get('/api/:table/auth', function (req, res) {
    if (req.authToken['custom_id']) connection.query('SELECT * FROM ?? WHERE `id` LIKE "' + req.authToken['custom_id'] + '"', [req.params.table], function (err, rows) {
        if (!err && rows[0]) {
            let id = rows[0].id;
            delete rows[0].password;
            delete rows[0].id;
            return res.json({
                "data": {
                    "id": id,
                    "type": "users",
                    "attributes": rows[0]
                }
            });
        } else return res.status(400).send('{"error": "Вы указали неправильный логин или пароль"}');
    });
});

async.map(instances, function (dbStore, callback) {
    dbStore.populate(callback);
}, function () {});

jsonApi.start();
