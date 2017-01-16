var express = require('express');
var faker = require('faker');
var cors = require('cors');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

var user = {
    username: 'a',
    password: 'a'
}
var jwtSecret = 'asdf';

var app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressJwt({secret: jwtSecret}).unless({path: ['/login']}));

app.get('/random-user',function(req, res, next){
    var user = faker.helpers.userCard();
    user.avatar = faker.image.avatar();
    res.json(user);
    next();
});

app.post('/login', authenticate, function(req,res,next){
    var token = jwt.sign({username: user.username}, jwtSecret);
    res.send({token: token, user: user});
});

app.get('/me',function(req,res,next){
    res.send(req.user);
});
app.listen(3000,function(){
    console.log("Application listening at => localhost:3000");
});

//UTIL Functions
function authenticate(req, res, next){
    var body = req.body;
    if(!body.username || !body.password){
        res.send(400).end('Must provide username or password');
    }
    if(body.username !== user.username || body.password !== user.password){
        // res.send(401).end('Username or password is incorrect');
        res.sendStatus(401).end('Username or password is incorrect');
    }
    next();
}