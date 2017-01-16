var express = require('express');
var faker = require('faker');
var cors = require('cors');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

//Database Connection
var mysql = require('./scripts/sqlCTOQueries.js');
mysql.createPool('localhost','root','','user_credentials');

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
    console.log(req.body);
    var token = jwt.sign({username: req.body.username}, jwtSecret);
    res.send({token: token, username: req.body.username});
});

app.get('/me',function(req,res,next){
    res.send(req.username);
});
app.listen(3000,function(){
    console.log("Application listening at => localhost:3000");
});

//UTIL Functions
function authenticate(req, res, next){
    var body = req.body;

    if(!body.username || !body.password){
        res.send(400).end('Must provide username or password');
    }else{
        var sql_getUserExtraConditions = body.username + '\" AND password =\"' + body.password +'\"';
        mysql.readSQLDataSingle("GetUser",function(user){
            console.log('From database');
            console.log(user);
            if(user.length){
                console.log("User exists");
                var username = body.username;
                next(); 
            }else{
                console.log("Username or password is incorrect");
                res.sendStatus(401).end('Username or password is incorrect');
            }
        },sql_getUserExtraConditions);
    }
}
