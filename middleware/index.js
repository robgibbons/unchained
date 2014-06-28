// Passport-local example
var Users = {
    users: [
        { id: 1, username: 'bob', password: 'pass', email: 'bob@example.com' },
        { id: 2, username: 'joe', password: 'word', email: 'joe@example.com' }
    ],
    findByUsername: function (username, fn) {
        for (var i = 0, len = Users.users.length; i < len; i++) {
            var user = Users.users[i];
            if (user.username === username) {
                return fn(null, user);
            }
        }
        return fn(null, null);
    },
    findById: function (id, fn) {
        var idx = id - 1;
        if (Users.users[idx]) {
            fn(null, Users.users[idx]);
        } else {
            fn(new Error('User ' + id + ' does not exist'));
        }
    }
};
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    Users.findById(id, function (err, user) {
        done(err, user);
    });
});
passport.use(new localStrategy(
    function(username, password, done) {
        process.nextTick(function () {
            Users.findByUsername(username, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
                if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
                return done(null, user);
            });
        });
    }
));


// Passport login
exports.loginUser = passport.authenticate('local', { failureRedirect: '/login' });

// Passport logout
exports.logoutUser = function (req, res, next) {
    if (req.isAuthenticated()) req.logout();
    return next();
};

// Redirect to home if user is logged in
exports.redirectUser = function (req, res, next) {
    if (req.isAuthenticated()) res.redirect('/');
    return next();
}

// Redirect if user is not logged in
exports.requireLogin = function (req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Force trailing URL slashes
exports.addSlashes = function (base_url) {
    return function(req, res, next) {
        (req.url.substr(-1) !== '/' && req.url.length > 1) ? res.redirect(301, (base_url || '') + req.url + '/') : next();
    };
};
