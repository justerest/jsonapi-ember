const jsonApi = require("jsonapi-server"),
    app = jsonApi.getExpressServer(),
    appSettings = require('./lib/app-settings.js'),
    bearerSettings = require('./lib/bearer-settings.js'),
    resources = require('./lib/resources.js'),
    routing = require('./lib/routing.js');

jsonApi.setConfig({
    port: 443,
    graphiql: false,
    base: 'api'
});

resources(jsonApi);

appSettings(app);

bearerSettings(app);

routing(app);

jsonApi.start();
