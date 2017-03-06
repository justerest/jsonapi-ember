const jsonApi = require("jsonapi-server"),
    app = jsonApi.getExpressServer(),
    appSettings = require('./lib/app-settings.js'),
    bearerSettings = require('./lib/bearer-settings.js'),
    routing = require('./lib/routing.js');

require('./lib/resourses.js');

jsonApi.setConfig({
    port: 80,
    graphiql: false,
    base: 'api'
});

appSettings(app);

bearerSettings(app);

routing(app);

jsonApi.start();
