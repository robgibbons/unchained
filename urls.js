module.exports = {
    '/': {
        get: [m.requireLogin, view.auth('home')]
    },
    '/profile/': [m.requireLogin, view.render('profile')],
    '/login/': {
        get: [m.redirectUser, view.render('login')],
        post: [m.loginUser, view.redirect('/')],
    },
    '/logout/': [m.logoutUser, view.redirect('/login')],
    '/error/(:err_no)?/?': view.Error,
    '*': view.redirect('/error/404/'),
};