var express = require('express');
var faker = require('faker');

var app = express();

app.get('/',function(req, res, next){
    res.send("App is UP and RUNNING");
    next();
});
app.get('/random-user',function(req, res, next){
    var user = faker.helpers.userCard();
    user.avatar = faker.image.avatar();
    res.json(user);
    next();
});
app.listen(3000,function(){
    console.log("Application listening at => localhost:3000");
});