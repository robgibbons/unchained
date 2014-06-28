// Generic URL redirect view
exports.redirect = function (url) {
    return function (req, res) {
        res.redirect(url);
    };
};

// Generic rendered template view
exports.render = function (template) {
    return function (req, res) {
        res.render(template, { params: req.params, user: req.user });
    };
};

// Same as exports.render() but with login required
exports.auth = function (template) {
    return [m.requireLogin, view.render(template)];
};

// Generic error page view (404, etc)
exports.Error = function (req, res) {
    res.render('error', { err_no: req.params.err_no });
};
