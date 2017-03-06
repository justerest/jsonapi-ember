const configMySQL = require('./confmysql.js'),
    mysql = require('mysql'),
    connection = mysql.createConnection(configMySQL.forMySQLconnect),
    multer = require('multer'),
    fs = require('fs-extra'),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const dir = __dirname + '/../../../' + configMySQL.host + '/public_html/upload/' + req.params.user + '/new/' + req.params.name;
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
    nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport(configMySQL.mail);

module.exports = function (app) {

    app.post('/upload/:user/:name', upload.single('file'), function (req, res) {
        res.send({
            imgName: req.file.filename
        });
    });

    app.post('/check/upload/', function (req, res) {
        const user = req.body.username;
        const dir = __dirname + '/../../../' + configMySQL.host + '/public_html/upload/' + user;
        imagemin([dir + '/new/**'], dir + '/files').then((f) => {
            res.send("OK");
            fs.emptyDir(dir + '/new');
        }, (e) => {
            res.status(513).send(e);
            fs.emptyDir(dir + '/new');
        });
    });

    app.delete('/api/images/:id', function (req, res, next) {
        const dir = __dirname + '/../../../' + configMySQL.host + '/public_html';
        connection.query('SELECT * FROM `images` WHERE `id` LIKE "' + req.params.id + '"', function (err, rows) {
            const dirRem = rows[0].path;
            if (!err && rows && dirRem) {
                fs.remove(dir + dirRem.replace(/https:\/\/'+configMySQL.host+'/, ''));
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
}
