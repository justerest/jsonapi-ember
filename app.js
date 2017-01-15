let configMySQL = require('./lib/confmysql.js');

var jsonApi = require("jsonapi-server");
var RelationalDbStore = require("jsonapi-store-relationaldb");
var app = jsonApi.getExpressServer();
var bodyParser = require('body-parser');
var moment = require('moment');
var bearer = require('bearer');
var mysql = require('mysql');
var async = require("async");
var connection = mysql.createConnection(configMySQL.forMySQLconnect);
var multer = require('multer');
var fs = require('fs-extra');
var imagemin = require('imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminMozjpeg = require('imagemin-mozjpeg');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = __dirname + '/../gorodrazvlecheniy/public/upload/' + req.params.user + '/new/' + req.params.name;
        fs.emptyDir(dir, function () {
            fs.mkdirs(dir, function (err) {
                cb(null, dir);
            });
        });
    },
    filename: function (req, file, cb) {
        cb(null, moment(Date.now()) + '_' + file.originalname);
    }
});

var upload = multer({
    storage: storage
});

var instances = [];

let dbStore = new Array();
for (let i = 1; i <= 6; i++) {
    dbStore[i] = new RelationalDbStore(configMySQL.forJsonApi);
    instances.push(dbStore[i]);
}

fs.readFile('C:/Users/lubov/Desktop/_ember/gorodrazvlecheniy/app/models/company.js', 'utf8', (err, fd) => {
    let mystr = fd;
    let one = 'export default DS.Model.extend({';
    mystr = mystr.slice(mystr.indexOf(one) + one.length, mystr.length - 5);
    mystr = mystr.replace(/\r\n/g, '').replace(/\s/g, '').replace(/'/g, '"');
    let ob = {};
    let n = 0;
    for (let i = 0; i < mystr.length; i++) {
        if (mystr[i] == ',') n = i + 1;
        if (mystr[i] == ':') {
            let str = mystr.slice(i, i + 10);
            let rav = str == ':DS.attr()' ? jsonApi.Joi.string() : str == ':DS.attr("number")' ? jsonApi.Joi.number() : ;
            ob[mystr.slice(n, i)] =
        }
    }
    console.log(ob);
});

jsonApi.setConfig({
    port: 80,
    graphiql: false,
    base: 'api'
});

jsonApi.define({
    resource: "notetypes",
    handlers: dbStore[6],
    attributes: {
        name: jsonApi.Joi.string(),
        children: jsonApi.Joi.belongsToMany({
            resource: "notetypes",
            as: "parent"
        }),
        parent: jsonApi.Joi.one('notetypes')
    }
});
jsonApi.define({
    resource: "gallaries",
    handlers: dbStore[1],
    attributes: {
        name: jsonApi.Joi.string(),
        images: jsonApi.Joi.belongsToMany({
            resource: "images",
            as: "gallary"
        }),
        company: jsonApi.Joi.one('companies')
    }
});
jsonApi.define({
    resource: "images",
    handlers: dbStore[2],
    attributes: {
        path: jsonApi.Joi.string(),
        typeimage: jsonApi.Joi.string(),
        user: jsonApi.Joi.one('users'),
        gallary: jsonApi.Joi.one('gallaries')
    }
});
jsonApi.define({
    resource: "notes",
    handlers: dbStore[3],
    attributes: {
        title: jsonApi.Joi.string(),
        content: jsonApi.Joi.string(),
        typenote: jsonApi.Joi.string(),
        author: jsonApi.Joi.one('users'),
        company: jsonApi.Joi.one('companies')
    }
});
jsonApi.define({
    resource: "companies",
    handlers: dbStore[4],
    attributes: {
        name: jsonApi.Joi.string(),
        class: jsonApi.Joi.string(),
        logo: jsonApi.Joi.string(),
        thumb: jsonApi.Joi.string(),
        info: jsonApi.Joi.string(),
        address: jsonApi.Joi.string(),
        phone: jsonApi.Joi.string(),
        worktime: jsonApi.Joi.string(),
        website: jsonApi.Joi.string(),
        vk: jsonApi.Joi.string(),
        odnoklassniki: jsonApi.Joi.string(),
        facebook: jsonApi.Joi.string(),
        owner: jsonApi.Joi.one('users'),
        notes: jsonApi.Joi.belongsToMany({
            resource: "notes",
            as: "company"
        }),
        gallaries: jsonApi.Joi.belongsToMany({
            resource: "gallaries",
            as: "company"
        })
    }
});
jsonApi.define({
    resource: "users",
    handlers: dbStore[5],
    attributes: {
        username: jsonApi.Joi.string(),
        password: jsonApi.Joi.string(),
        fullname: jsonApi.Joi.string(),
        roles: jsonApi.Joi.string(),
        phone: jsonApi.Joi.string(),
        email: jsonApi.Joi.string().email(),
        money: jsonApi.Joi.number(),
        companies: jsonApi.Joi.belongsToMany({
            resource: "companies",
            as: "owner"
        }),
        notes: jsonApi.Joi.belongsToMany({
            resource: "notes",
            as: "author"
        }),
        images: jsonApi.Joi.belongsToMany({
            resource: "images",
            as: "user"
        })
    }
});

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
    secureRoutes: [{
            url: '/api/users/*',
            method: 'get',
            //roles: 'admin'
      }
    ]
});



//==============================================================================
//Routing
app.get('/api/:table/auth', function (req, res, next) {
    let id = req.authToken['custom_id'];
    if (!id) return res.status(402).send('No ID');
    req.path = '/api/users/' + id;
    req.href = '/api/users/' + id;
    req.url = '/api/users/' + id;
    next();
});

app.post('/upload/:user/:name', upload.single('file'), function (req, res) {
    res.send({
        dest: req.file.destination,
        imgName: req.file.filename
    });
});

app.post('/api/images/', function (req, res, next) {
    let user = req.authToken.username;
    let dir = __dirname + '/../gorodrazvlecheniy/public/upload/' + user;
    imagemin([dir + '/new/**'], dir + '/files', {
        plugins: [
        imageminMozjpeg(),
        imageminPngquant({
                quality: '65-80'
            })
    ]
    }).then((f) => {}, (e) => {});
    fs.emptyDir(dir + '/new');
    next();
});

app.delete('/api/images/:id', function (req, res, next) {
    let dir = __dirname + '/../gorodrazvlecheniy/public';
    connection.query('SELECT * FROM `images` WHERE `id` LIKE "' + req.params.id + '"', function (err, rows) {
        if (!err && rows) {
            dir += rows[0].path;
            fs.remove(dir);
            next();
        }
    });
});

async.map(instances, function (dbStore /*, callback*/ ) {
    dbStore.populate( /*callback*/ );
}, function () {});

jsonApi.start();
