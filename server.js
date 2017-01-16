var express = require('express');
var faker = require('faker');
var cors = require('cors');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app = express();

app.use(cors());
app.use();

app.get('/random-user',function(req, res, next){
    var user = faker.helpers.userCard();
    user.avatar = faker.image.avatar();
    res.json(user);
    next();
});

app.post('/login', authenticate, function(req,res){

});
app.listen(3000,function(){
    console.log("Application listening at => localhost:3000");
});

//UTIL Functions
function authenticate(req, res, next){

}