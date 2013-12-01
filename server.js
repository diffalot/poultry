var express = require('express'),
    auth= require('connect-auth'),
    request = require('request'),
    uuid = require('node-uuid'),
    browserify = require('browserify');

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
  .use(express.cookieParser(cookieSecret))
  .use(express.session())
  .use(express.bodyParser())
  .use(auth(
    [ auth.Twitter({ consumerKey: twitterConsumerKey, consumerSecret: twitterConsumerSecret }) ]
  ))
  .use(allowCrossDomain)
  .get('/', function(req, res){
    if(req.isAuthenticated()){
      res.send('you\'re logged in!');
    }else{
      res.send('not logged in');
    }
  })
  .get('/bookmarklet.js', function(req, res){
    var b = browserify();
    b.add('./bookmarklet.js');
    b.bundle().pipe(res);
  })
  .get('/authState', function(req, res) {
    console.log('generating state');
    // generate a token for this session
    var csrf_token = uuid.v4();
    req.session.csrf_tokens = req.session.csrf_tokens || [];
    req.session.csrf_tokens.push(csrf_token);
    if (req.session.csrf_tokens.length > 4) {
      req.session.csrf_tokens.shift();
    }
    console.log(req.session);
    res.send({oauthio_state: csrf_token});
  })
  .post('/authTwitter', function(req, res) {
    console.log('receiving a state');
    console.log(req.body.code);
    request.post({
      url: 'https://oauth.io/auth/access_token',
      json: {
        code: req.body.code,
        key: 'F6-Ns5MMCaG6zp4BkC-Ikfq3o-0',
        secret: oauthIOSecret
      }
    },
    function(error, response, body) {
      console.log('response from twitter?');
      console.dir(body);
      res.send('server received credentials');
    });


  })
  .listen(9001);
