module.exports = {
    '/': view.auth('home'), // Helper method (generator)
    '/profile/': [m.requireLogin, view.render('profile')], // Equivalent to auth() helper used above
    '/login/': { // Express an entire view definition within urls.js
        get: [m.redirectUser, view.render('login')],
        post: [m.loginUser, view.redirect('/')],
    },
    '/logout/': [m.logoutUser, view.redirect('/login')],
    '/error/(:err_no)?/?': view.Error,
    '*': view.redirect('/error/404/'),
};
