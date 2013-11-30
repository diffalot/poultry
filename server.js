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

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err.stack);
});

var app= express();
app.use(express.static(__dirname + '/dist'))
   .use(express.cookieParser('my secret here'))
   .use(express.session())
   .use(express.bodyParser())
   .use(auth({strategies:[
              auth.Twitter({consumerKey: twitterConsumerKey, consumerSecret: twitterConsumerSecret})],
              trace: true,
              logoutHandler: require('connect-auth/lib/events').redirectOnLogout("/")}));

app.get('/', function(req, res){
    if(req.isAuthenticated()){
        res.send(req.session.auth.user);
    }else{
        res.send('false');
    }
});

app.get('/logout', function(req, res){
    req.logout();
});

app.get('/login', function(req, res){
    req.authenticate(['twitter'], function(error, authenticated){
        console.log(arguments);

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
                console.log(arguments);
                // We've either failed to authenticate, or succeeded (req.isAuthenticated() will confirm, as will the value of the received argument)
                //next();
                res.redirect('/');
            }
        }});
})

app.listen(9001);
