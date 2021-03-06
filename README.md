Unchained
=========

### ([npm install unchained](https://www.npmjs.com/package/unchained))

Unchained abstracts the [Express](https://github.com/visionmedia/express) framework, providing a modular MVC-style structure for your [Node.js](https://github.com/joyent/node) projects. Aiming only to provide a lightweight layer of syntax sugar above Express, it should be fully compatible with existing Express modules and middleware.

### How's it work?

Unchained requires Express for you, as well as your views, models, routes and middleware. Defining a view, model, or middleware function is a simple **.js** file in the appropriate folder. Routes are defined declaratively with a simple dictionary in urls.js. Template rendering is provided by [Swig](https://github.com/paularmstrong/swig) ([Django](https://github.com/django/django)-style templates). Control your Express app's familiar settings in config.js.

## Getting Started

A typical project starts out with the following structure:

    /middleware
    /models
    /templates
    /views
    app.js
    config.js
    urls.js

Simply run **npm install unchained**, and require unchained in your **app.js**. Pass the root module and directory and Unchained will require the rest of your modules:

```javascript
// app.js
app = require('unchained')(module, __dirname);
```

### Routes

In your main app directory, create the **urls.js** module. Route definitions are stored here as a simple dictionary (Object-literal), with keys defining routes, and values specifying desired controllers (views):

```javascript
// urls.js
module.exports = {
    '/': view.Home,
    '/about/': view.About,
    '/contact/': view.Contact,
    '/profile/': view.Profile,
    '/search/': view.Search
};
```

### Views

All views, models and middleware components are defined as **.js** modules in the appropriate folder, with the name of the module specifying the name of the component. Modules are automatically namespaced under the globals **view**, **model** and **m** (for middleware).

To create a new view called **view.Profile**, create a .js file in the **/views** directory named **Profile.js**:

```javascript
// views/Profile.js
// Simple Function-based view
module.exports = function (req, res) {
    res.render('profile'); // Renders /templates/profile.html
};
```

View definitions can be composed of Functions, Objects or Arrays (for middleware). The Function-based view above does not specify any HTTP method, so by default it matches **all** HTTP methods. You can override the default HTTP method within **config.js**. Or, you can just define your view as an Object-literal. With an Object-literal view, you can specify explicit HTTP methods for a given route:

```javascript
// views/Profile.js
// Object-literal syntax (Explicit HTTP Methods)
module.exports = {
    get: function (req, res) {
        res.render('profile');
    },
    post: function (req, res) {
        // Do something with POST request
        res.render('profile');
    }
};
```

### Middleware

There are a few places you can choose to assign middleware within your app. You can have middleware attached to your views, attached to your routes, or bound directly to Express inside config.js (for global middleware).

#### Wrapping Views

You can assign middleware directly to your view definitions by wrapping them with an **Array literal**, always passing your view object as the last item in the stack. Any number of middleware functions may be passed in this Array style:

```javascript
// views/Profile.js
// Array syntax (Route Middleware) -- Maps to all()
module.exports = [m.requireLogin, m.exampleWare, function (req, res) {
    res.render('profile');
}];
```

Either type of view object can be wrapped with a middleware Array, whether it be a simple Function-based view as above, or an Object-literal view, with multiple HTTP methods defined:

```javascript
// views/Profile.js
// Wrapping both HTTP methods with Middleware
module.exports = [m.requireLogin, m.exampleWare, {
    get: function (req, res) {
        res.render('profile');
    },
    post: function (req, res) {
        // Do something with POST request
        res.render('profile');;
    }
}];
```

You can choose to wrap only a specific HTTP method with a middleware Array, instead of the entire view Object (which assigns to each of the methods defined):

```javascript
// views/Profile.js
// Wrapping a single HTTP method with Middleware
module.exports = {
    get: function (req, res) {
        res.render('profile');
    },
    post: [m.requireLogin, function (req, res) {
        // Do something with POST request
        res.render('profile');
    }]
};
```

You can even use **nested** middleware definitions within Object-literal views:

```javascript
// views/Profile.js
// Nested middleware in Object-literal view
module.exports = [m.requireLogin, {
    get: function (req, res) {
        res.render('profile');
    },
    post: [m.validateInput, function (req, res) {
        // Do something with POST request
        res.render('profile');
    }]
}];
```

Middleware nested in this style is executed **outside-in**, so POST requests received by the view will first call requireLogin, then validateInput. Any GET requests would call only the outer requireLogin middleware.

#### Middleware/View Expressions in urls.js

Entire view definitions may be expressed directly in urls.js. This allows you to express middleware and views without creating more modules. Middleware Array syntax is identical, with a view object passed as the last Array item.

```javascript
// urls.js
// Middleware assigned directly in Routes
module.exports = {
    '/': view.auth('home'),
    '/about/': [m.requireLogin, view.render('about')],
    '/profile/': [m.requireLogin, view.render('profile')],
    '/login/': {
        get: [m.redirectUser, view.render('login')],
        post: [m.loginUser, view.redirect('/')],
    },
    '/logout/': [m.logoutUser, view.redirect('/login')],
    '/error/(:err_no)?/?': view.Error,
    '*': view.redirect('/error/404/'),
};
```
### Helper methods (Generators)

You may have noticed a few helper methods in urls.js above, namespaced under the view object. The methods **view.auth**, **view.render** and **view.redirect** are actually reusable view generators, or helpers, which take in arguments and return customized views. You can build up a collection of reusable helpers, avoiding further need to create explicit modules for everything.

Generator methods can leverage middleware, models, and can be defined just like normal modules. You can create them inside **/views**, **/models** and **/middleware**, but I recommend storing helpers together in the **index.js** of their respective folders (I've included a few as an example). The /about/ and /profile/ view expressions above are functionally equivalent to **view.auth**.

### Bare-Metal Express

Configure your Express app directly, within **config.js**. Config.js exposes the Express app instance used "under the hood" by Unchained. 

```javascript
// config.js
// Configuring global middleware and other Express options
module.exports = function (app) {

    app.set('listen_port', 8080); // Default listening port (8080)
    app.set('default_method', 'all'); // Default HTTP verb for Function-based views (all)
    app.set('view engine', 'html');
    app.set('views', app.get('root_dir') + '/templates'); // HTML template directory
    app.engine('html', swig.renderFile); // Easy to use another rendering engine
    app.enable('strict routing');
    app.use(m.addSlashes());
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.session({ secret: '.PLEASE_CHANGE-ME*1a2b3c4d5e6f7g8h9i0j!' }));
    
    // Passport-local example
    app.use(passport.initialize());
    app.use(passport.session());

    return app;
};
```


