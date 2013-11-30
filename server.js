var connect = require('connect'),
    auth= require('connect-auth'),
    url = require('url'),
    fs = require('fs');

var OAuth= require('oauth').OAuth;

var getSharedSecretForUserFunction = function(user,  callback) {
	var result;
	if(user == 'foo')
		result= 'bar';
	callback(null, result);
};

var validatePasswordFunction = function(username, password, successCallback, failureCallback){
	if (username === 'foo' && password === "bar"){
		successCallback();
	} else {
		failureCallback();
	}
};

// N.B. TO USE Any of the OAuth or RPX strategies you will need to provide
// a copy of the example_keys_file (named keys_file)
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

// Setup the 'template' pages (don't use sync calls generally, but meh.)
var authenticatedContent= fs.readFileSync( __dirname+"/authenticated.html", "utf8" );
var unAuthenticatedContent= fs.readFileSync( __dirname+"/unauthenticated.html", "utf8" );

// There appear to be Scurrilous ;) rumours abounding that connect-auth
// doesn't 'work with connect' as it does not act like an 'onion skin'
// to address this I'm showing how one might extend the *PRIMITIVES*
// provided by connect-auth to simplify a middleware layer.

// This middleware detects login requests (in this case requests with a query param of ?login_with=xxx where xxx is a known strategy)
var example_auth_middleware= function() {
  return function(req, res, next) {
    var urlp= url.parse(req.originalUrl, true)
    if( urlp.query.login_with ) {
      req.authenticate([urlp.query.login_with], function(error, authenticated) {
        if( error ) {
          // Something has gone awry, behave as you wish.
          console.log( error );
          res.end();
      }
      else {
          if( authenticated === undefined ) {
            // The authentication strategy requires some more browser interaction, suggest you do nothing here!
          }
          else {
            if( urlp.query.login_with == "persona" && authenticated === false ) {
              // persona behaves differently to the other strategies as it is async-to-the-page POST.
              res.writeHead(401, "" );
              res.end()
            }
            else {
              if( authenticated == true ) {
                req.getAuthDetails().activeStrategy= urlp.query.login_with;
              }
              // We've either failed to authenticate, or succeeded (req.isAuthenticated() will confirm, as will the value of the received argument)
              next();
            }
          }
      }});
    }
    else {
      next();
    }
  }
};

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err.stack);
});

var app= connect();
app.use(connect.static(__dirname + '/dist'))
   .use(connect.cookieParser('my secret here'))
   .use(connect.session())
   .use(connect.bodyParser())
   .use(auth({strategies:[ auth.Anonymous(),
                     auth.Twitter({consumerKey: twitterConsumerKey, consumerSecret: twitterConsumerSecret})],
              trace: true,
              logoutHandler: require('./events').redirectOnLogout("/")}))
   .use(example_auth_middleware())
   .use('/logout', function(req, res, params) {
     req.logout(); // Using the 'event' model to do a redirect on logout.
   })
   .use("/", function(req, res, params) {
     res.writeHead(200, {'Content-Type': 'text/html'})
     if( req.isAuthenticated() ) {
       var logoutApproach= "";
       if( req.getAuthDetails().activeStrategy  == "persona" ) {
         logoutApproach= "<a href='#' onclick='navigator.id.logout();'>Logout</a>";
       }
       else {
         logoutApproach= "<a href='/logout'>Logout</a>";
       }
       res.end( authenticatedContent.replace("#USER#", JSON.stringify( req.getAuthDetails().user )  )
                                       .replace("#LOGOUTAPPROACH#", logoutApproach) );
     }
     else {
       res.end( unAuthenticatedContent.replace("#PAGE#", req.originalUrl));
     }
   })
   .listen(9001);
