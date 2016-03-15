var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');

var routes = require('./app/routes/index');
var clients = require('./app/routes/clients');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
//Initialise le middleware de session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('less-middleware')(
    path.join(__dirname, 'sources'), {
        dest: path.join(__dirname, 'public')
    }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/client', clients);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Connection a la base MongoDb
mongoose.connect('mongodb://localhost/Allovoisin', function (err) {
    if (err)
        throw err;
});


module.exports = app;
