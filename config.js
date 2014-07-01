module.exports = function (app) {

    // All your config are belong to Express
    app.engine('html', swig.renderFile);
    app.enable('strict routing');
    app.set('listen_port', 80);
    app.set('default_method', 'get');
    app.set('view engine', 'html');
    app.set('views', app.get('root_dir') + '/templates');
    app.use(m.addSlashes());
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.session({ secret: '.PLEASE_CHANGE-ME*1a2b3c4d5e6f7g8h9i0j!' }));
    app.use(passport.initialize());
    app.use(passport.session());

    return app;
};
