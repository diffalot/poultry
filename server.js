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
};
// require twitter authentication for some things
var protect = function(req, res, next) {
  if( req.isAuthenticated() ) next();
  else {
    req.authenticate(function(error, authenticated) {
      if( error ) next(new Error("Problem authenticating"));
      else {
        if( authenticated === true)next();
        else if( authenticated === false ) next(new Error("Access Denied!"));
        else {
          // Abort processing, browser interaction was required (and has happened/is happening)
        }
      }
    })
  }
};

var app = express()
  .use(express.static(__dirname + '/dist'))
  .use(express.cookieParser(cookieSecret))
  .use(express.session())
  .use(auth(
    [ auth.Twitter({ consumerKey: twitterConsumerKey, consumerSecret: twitterConsumerSecret }) ]
  ))
  .use(allowCrossDomain)
  .get('/', protect, function(req, res){
    if(req.isAuthenticated()){
      res.send('you\'re logged in!');
    }else{
      res.send('not logged in');
    }
  })
  .post('/sendTweet', protect, function(req, res) {
    console.dir(req);
  })
  .get('/sendTweet', protect, function(req, res) {
    console.dir(req);
  })
  .listen(9001);
