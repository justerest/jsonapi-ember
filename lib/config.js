const host = 'kscript.ru';
const dbName = 'kamertonmu_kscript';
const user = 'kamertonmu_just';
const password = 'PKCXLWEQ';

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
    },
    host: host
}
