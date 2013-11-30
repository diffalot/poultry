var express = require('express'),
auth= require('connect-auth');

var OAuth= require('oauth').OAuth;

// load twitter auth keys
try {
  var example_keys= require('./auth_keys');
  for(var key in example_keys) {
    global[key]= example_keys[key];
  }
}
catch(e) {
  console.log('Unable to locate the auth_keys.js file.  Please copy and ammend the example_keys_file.js as appropriate');
  return;
}

// handle random errors
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err.stack);
});

// allow CORS via middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', allowedDomains);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

var app = express()
  .use(express.static(__dirname + '/dist'))
  .use(express.cookieParser(cookieSecret))
  .use(express.session('poultry'))
  .use(express.bodyParser())
  .use(allowCrossDomain)
  .use(auth({
    strategies:[ auth.Twitter({
      consumerKey: twitterConsumerKey,
      consumerSecret: twitterConsumerSecret
    })],
    trace: true,
    logoutHandler: require('connect-auth/lib/events').redirectOnLogout("/")
  }))
  .get('/', function(req, res){
    if(req.isAuthenticated()){
      res.send('you\'re logged in!');
    }else{
      res.send('not logged in');
    }
  })
  .get('/logout', function(req, res){
    req.logout();
  })
  .get('/login', function(req, res){
    req.authenticate(['twitter'], function(error, authenticated){
      console.log(arguments);
      if( error ) {
        console.log( error );
        res.end();
      }
      else {
        if( authenticated === undefined ) {}
        else {
          console.log(arguments);
          res.redirect('/');
        }
      }});
  })
  .post('/sendTweet', function(req, res) {
    if(req.isAuthenticated()){
      console.dir(req);
      res.send('complete');
    }else{
      res.send('false');
    }
  })
  .listen(9001);
