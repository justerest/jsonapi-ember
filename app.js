let configMySQL = require('./lib/confmysql.js'),
    jsonApi = require("jsonapi-server"),
    RelationalDbStore = require("jsonapi-store-relationaldb"),
    app = jsonApi.getExpressServer(),
    bodyParser = require('body-parser'),
    moment = require('moment'),
    bearer = require('bearer'),
    mysql = require('mysql'),
    //aSync = require("async"),
    connection = mysql.createConnection(configMySQL.forMySQLconnect),
    multer = require('multer'),
    fs = require('fs-extra'),
    //imagemin = require('imagemin'),
    //imageminWebp = require('imagemin-webp'),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            let dir = __dirname + '/../../kscript.ru/public_html/upload/' + req.params.user + '/new/' + req.params.name;
            fs.emptyDir(dir, function () {
                fs.mkdirs(dir, function (err) {
                    cb(null, dir);
                });
            });
        },
        filename: function (req, file, cb) {
            cb(null, moment(Date.now()) + '_' + file.originalname + '.png');
        }
    }),
    upload = multer({
        storage: storage
    }),
    instances = [],
    nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport(configMySQL.mail),
    compression = require('compression');

jsonApi.setConfig({
    port: 443,
    graphiql: false,
    base: 'api'
});

jsonApi.define({
    resource: "bonuscards",
    handlers: new RelationalDbStore(configMySQL.forJsonApi),
    attributes: {
        company: jsonApi.Joi.one('companies'),
        text: jsonApi.Joi.string(),
        image: jsonApi.Joi.string()
    }
});
jsonApi.define({
    resource: "events",
    handlers: new RelationalDbStore(configMySQL.forJsonApi),
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
    handlers: new RelationalDbStore(configMySQL.forJsonApi),
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
    handlers: new RelationalDbStore(configMySQL.forJsonApi),
    attributes: {
        money: jsonApi.Joi.number(),
        user: jsonApi.Joi.one('users')
    }
});
jsonApi.define({
    resource: "notetypes",
    handlers: new RelationalDbStore(configMySQL.forJsonApi),
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
    handlers: new RelationalDbStore(configMySQL.forJsonApi),
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
    handlers: new RelationalDbStore(configMySQL.forJsonApi),
    attributes: {
        path: jsonApi.Joi.string(),
        typeimage: jsonApi.Joi.string(),
        user: jsonApi.Joi.one('users'),
        gallary: jsonApi.Joi.one('gallaries')
    }
});
jsonApi.define({
    resource: "companies",
    handlers: new RelationalDbStore(configMySQL.forJsonApi),
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

let chainHandler = new jsonApi.ChainHandler();
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
    handlers: chainHandler.chain(new RelationalDbStore(configMySQL.forJsonApi)),
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

let shemy = jsonApi._resources;
for (let key in shemy) {
    for (let key2 in shemy[key]['attributes']) {
        shemy[key]['attributes'][key2] = shemy[key]['attributes'][key2].allow(null);
    }
    for (let key2 in shemy[key]['onCreate']) {
        shemy[key]['onCreate'][key2] = shemy[key]['onCreate'][key2].allow(null);
    }
}

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

app.use(compression());

bearer({
    //Make sure to pass in the app (express) object so we can set routes
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

//==============================================================================
//Routing

app.post('/upload/:user/:name', upload.single('file'), function (req, res) {
    res.send({
        imgName: req.file.filename
    });
});

app.post('/check/upload/', function (req, res) {
    let user = req.body.username;
    let dir = __dirname + '/../../kscript.ru/public_html/upload/' + user;
    imagemin([dir + '/new/**'], dir + '/files').then((f) => {
        res.send("OK");
        fs.emptyDir(dir + '/new');
    }, (e) => {
        res.status(513).send(e);
        fs.emptyDir(dir + '/new');
    });
});

app.delete('/api/images/:id', function (req, res, next) {
    let dir = __dirname + '/../../kscript.ru/public_html';
    connection.query('SELECT * FROM `images` WHERE `id` LIKE "' + req.params.id + '"', function (err, rows) {
        let dirRem = rows[0].path;
        if (!err && rows && dirRem) {
            dir += dirRem.replace(/https:\/\/kscript.ru/, '');
            fs.remove(dir);
            next();
        }
    });
});

app.get('/current/time/', function (req, res) {
    res.send(moment(new Date).format('YYYYMMDDHH'));
});

app.post('/mail/send/', (req, res) => {
    const mailOptions = {
        from: '"Город Развлечений" <gorodinfo67@mail.ru>', // sender address
        to: req.body.to, // list of receivers
        subject: req.body.subject, // Subject line
        text: req.body.text, // plain text body
        html: req.body.html + '<br><br>Спасибо за то, что Вы с нами!<br><br>Город Развлечений, Смоленск.' // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.send(error);
        }
        res.send(info);
        //console.log('Message %s sent: %s', info.messageId, info.response);
    });
});

jsonApi.start();
