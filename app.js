
/**
 * Module dependencies.
 */

var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

// Configuration

app.configure(function(){
  app.use(express.logger({stream: accessLogfile}));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: settings.cookieSecret,
    store: new MongoStore({
      db: settings.db
  })
}));
  app.use(express.router(routes));
  app.use(express.static(__dirname + '/public'));
});

app.dynamicHelpers({
  user: function(req, res) {
    return req.session.user;
  },
  error: function(req, res) {
    var err = req.flash('error');
    if(err.length)
      return err;
    else  
      return null;
  },
  success: function(req,res) {
    var succ = req.flash('success');
    if(succ.length)
      return succ;
    else
      return null;
  }
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.error(function (err, req, res, next) {
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLogfile.write(meta + err.stack + '\n');
    next();
  });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
