var config = require('./config'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    http = require('http'),
    path = require('path'),
    mongojs = require('mongojs'),
    helmet = require('helmet');


//create express app
var app = express();

//keep reference to config
app.config = config;

//setup the web server
app.server = http.createServer(app);

// setup mongojs
app.db = mongojs('raw',['lists','cards','board']);

//setup mongoose
// app.db = mongoose.createConnection(config.mongodb.uri);
// app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
// app.db.once('open', function () {
//   //and... we have a data store
// });

//settings
// app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
app.use(require('morgan')('dev'));
// app.use(require('compression')());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('serve-favicon')(__dirname + '/public/favicon.ico'));
// app.use(require('method-override')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cryptoKey));
helmet(app);

//setup routes
require('./routes')(app);



//custom (friendly) error handler
app.use(require('./views/http/index').http500);

// setup utilities
app.utilities = {};
app.utilities.workflow = require('./utils/workflow');








// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handlers

// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });

var io = require('socket.io')(app.server);
io.on('connection', function(socket){
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
});

app.server.listen(app.config.port, function(){
  //and... we're live
});


module.exports = app;
