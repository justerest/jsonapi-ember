var host = 'kscript.ru';
var dbName = 'kamertonmu_kscript';
var user = 'kamertonmu_just';
var password = 'PKCXLWEQ';

module.exports = {
    forMySQLconnect: {
        host: host,
        user: user,
        password: password,
        database: dbName
    },
    forJsonApi: {
        dialect: "mysql",
        host: host,
        port: 3306,
        database: dbName, // If not provided, defaults to the name of the resource
        username: user,
        password: password,
        logging: false
    },
    bearer: "bv7oY7on$HM_0*&RG2PSCDKJCAJ83jdf",
    mail: {
        service: 'Mail.ru',
        auth: {
            user: 'gorodinfo67@mail.ru',
            pass: 'infogorod67'
        }
    }
}
