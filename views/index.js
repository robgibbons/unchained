// Generic URL redirect helper
exports.redirect = function (url) {
    return function (req, res) {
        res.redirect(url);
    };
};

// Generic template renderer view
exports.render = function (template) {
    return function (req, res) {
        res.render(template, { params: req.params, user: req.user });
    };
};

// Same as render() helper, but with login required
exports.auth = function (template) {
    return [m.requireLogin, view.render(template)];
};

// Generic error page (404, etc)
exports.Error = function (req, res) {
    res.render('error', { err_no: req.params.err_no });
};
