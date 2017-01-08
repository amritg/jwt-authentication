var express = require('express');
var app = express();
app.get('/',function(req, res, next){
    res.send("App is UP and RUNNING");
    next();
});
app.listen(3000,function(){
    console.log("Application listening at => localhost:3000");
});