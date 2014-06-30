Express... Unchained
=========

Unchained is a [Node.js](https://github.com/joyent/node) module which abstracts the underlying [Express](https://github.com/visionmedia/express) framework, encouraging a clear MVC structure for your Node.js projects. Unchained breaks your app into pieces, and maps it all together for you. Unchained aims to provide a simple layer of abstraction above Express, and should be fully compatible with most existing modules and middleware.

### How's it work?

Unchained takes care of requiring Express for you, as well as pulling together all of your views, models, routes and middleware. To define a view, model, or middleware function, it's as easy as creating a **.js** file in the appropriate folder. Routes are defined declaratively with a simple dictionary (object literal) inside urls.js. Template rendering is provided out-of-the-box with [Swig](https://github.com/paularmstrong/swig) ([Django](https://github.com/django/django)-style templates). Control all of your Express app's familiar settings inside config.js.

## Getting Started

A typical project starts out with the following structure:

    /middleware
    /models
    /templates
    /views
    app.js
    config.js
    urls.js

After installing **node** and **npm**, just run **npm install unchained** and require unchained inside of your app.js. Pass in the root module and app directory to allow Unchained to require the rest of your modules:

```javascript
// app.js
app = require('unchained')(module, __dirname);
```

### Routes

If you're building an app, you might need to define some routes. In your main app directory, create the **urls.js** module. Route definitions are stored here as a simple dictionary (Object-literal), with keys defining routes, and values specifying desired controllers (views):

```javascript
// urls.js
module.exports = {
    '/': view.Home,
    '/about/': view.About,
    '/profile/': view.Profile,
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

View definitions can be composed of Functions, Objects or Arrays (for middleware). The Function-based view above does not specify any specific HTTP method, so by default it matches **all** HTTP methods. You can override the default HTTP method within **config.js**. Or, you can just define your view as an Object-literal. With an Object-literal view, you can specify explicit HTTP methods for a given route:

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

There are two main places you can define middleware: inside your views, or inside of your routes.

#### Middleware in Views

You can assign Route-Specific Middleware directly to your views by wrapping them with an Array, always passing your view object as the last item in the Array. Any number of middleware functions may be passed in this style:

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
}];
```

Unchained also allows **nested** middleware definitions within Object-literal views. Notice the view below, wrapped with a middleware Array, and its POST method wrapped again inside. Middleware nested in this style is executed **outside-in**, so POST requests received by the view will first call requireLogin, then validateInput. GET requests will call only the requireLogin middleware:

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

#### Middleware in urls.js

If you prefer, you can declare the same route-specific middleware directly in urls.js. The middleware Array syntax is the same, with view objects passed as the last Array item:

```javascript
// urls.js
// Middleware assigned directly in Routes
module.exports = {
    '/': view.auth('home'),
    '/about/': [m.requireLogin, view.About],
    '/profile/': [m.requireLogin, view.Profile],
    '/login/': {
        get: [m.redirectUser, view.render('login')],
        post: [m.loginUser, view.redirect('/')],
    },
    '/logout/': [m.logoutUser, view.redirect('/login')],
    '/error/(:err_no)?/?': view.Error,
    '*': view.redirect('/error/404/'),
};
```
#### Generators (Constructors)

You might have noticed a few helper methods in urls.js above, attached to the view object. The methods **view.auth**, **view.render** and **view.redirect** are actually reusable view Generators, which take in arguments and return customized views. The /about and /profile view definitions above are functionally equivalent to **view.auth**.

Generator methods can leverage middleware, models, and can be created like normal modules. You can define them inside **/views**, **/models** and **/middleware**, but I recommend storing them in the **index.js** of their respective folder.

### Bare-Metal Express

You can easily define global middleware in your urls.js. Or you have the option to configure your Express app directly, within **config.js**. Config.js is composed of a callback function which exposes the Express instance used inside of unchained. 


```javascript
// config.js
// Configuring global middleware and other Express options
module.exports = function (app) {

    app.set('listen_port', 8080); // Defau;t listening port (8080)
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


