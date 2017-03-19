// We first require our express package
var express = require('express');
var bodyParser = require('body-parser');
var myData = require('./data.js');
var expressEjsLayouts = require('express-ejs-layouts');
var Guid = require('Guid');
var bcrypt = require("bcrypt-nodejs");
var cookieParser = require('cookie-parser');
var path = require('path');
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');

// This package exports the function to create an express instance:
var app = express();
var multer  =   require('multer');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});

var upload = multer({ storage : storage}).single('userPhoto');
var router = express.Router();
//app.use('/sayHello', router);

// We can setup Jade now!
app.set('view engine', 'ejs');
app.set('view options', { layout:'layout.ejs' });
app.use(expressEjsLayouts);
app.use(cookieParser());
// This is called 'adding middleware', or things that will help parse your request
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// This middleware will activate for every request we make to 
// any path starting with /assets;
// it will check the 'static' folder for matching files 
app.use('/assets', express.static('static'));
app.use(function(request, response, next){
    console.log("request.cookies.currentSessionId = "+request.cookies.currentSessionId);
    if(!request.cookies.currentSessionId){
        console.log("before creating session cookie");
        var expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getHours() + 1);
        var session = Guid.create().toString();
        response.cookie("currentSessionId", session, {expires: expiresAt});
        app.locals.userSession = request.cookies.currentSessionId;
    }
    next();
});
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 9;
rule.minute =30;
//rule.minute = new schedule.Range(0, 59, 2);

schedule.scheduleJob(rule, function(){
    console.log(rule);
    console.log('Today is recognized by Rebecca Black!---------------------------');
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'paperless.cs546@gmail.com', // Your email id
            pass: 'paperlessstevens' // Your password
        }
    });
    var mailOptions = {
        from: 'paperless.cs546@gmail.com', // sender address
        to: 'shingle@stevens.edu', // list of receivers
        subject: 'Email Example', // Subject line
        text: "hello" //, // plaintext body
        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        };
    });

});
//GET methods 
app.get("/", function (request, response) { 
    response.render("pages/index",{layout: false});
});
app.get("/dashboard", function (request, response) { 
    response.render("pages/dashboard",{ layout: true, choice: 'dashboard'});
  });

//Pooja Added
app.post("/forms", function (request, response){
   
    var currentSessionId = app.locals.userSession;
    console.log(request.body.company);
    console.log(request.body.contact);
    console.log(request.body.email);
    console.log(request.body.appliedOn);
    console.log(request.body.status);
    console.log(request.body.skills);
    console.log(request.body.username);
    console.log(request.body.followOn);
    console.log(request.body.reminder);
    console.log(request.body.note);

    myData.insertForm_forUser(request.body.username,request.body.currentSessionId,request.body.company,request.body.contact,request.body.email,request.body.appliedOn,request.body.status,request.body.skills,request.body.note,request.body.followOn,request.body.reminder).then(function(user) {
        //response.json(user);
        response.render("pages/forms",{ layout: true, choice: 'forms'});
    }, function(errorMessage) {
        response.status(500).json({ error: errorMessage });
    });
});

//pooja Added
app.get("/forms", function (request, response) { 
    
    var currentSessionId = app.locals.userSession;
    var company = request.query.company;
    var contact = request.body.contact;
    var email = request.body.email;
    var appliedOn = request.body.appliedOn;
    var status = request.body.status;
    var skills = request.body.skills; 
    var note = request.body.note;
    var reminder = request.body.reminder;
    var followOn = request.body.followOn;

    
    myData.insertForm_forUser(currentSessionId,company,contact,email,appliedOn,status,skills,note,reminder,followOn).then(function(user) {
        //response.json(user);
        response.render("pages/forms",{ layout: true, choice: 'forms'});
    }, function(errorMessage) {
        response.status(500).json({ error: errorMessage });
    });
}); 
app.get("/tables", function (request, response) { 
    response.render("pages/tables",{layout: true, choice: 'tables'});
});
app.get("/profile", function (request, response) { 
    response.render("pages/profile",{layout: true, choice: 'profile'});
});


//POST methods
app.post("/login", function (request, response) {    
   myData.getUser(request.body.username).then(function(user) {
        bcrypt.compare(request.body.pass, user.encryptedPassword, function (err, result) {
            if (result === true) {
                console.log("Passwords matches the hash, user id = "+user._id);
                
                console.log("before creating session cookie");
                var expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 1);
                response.cookie("currentSessionId", user.currentSessionId, {expires: expiresAt});
                response.locals.userSession = request.cookies.currentSessionId;
                myData.insertSessionID(user._id,user.currentSessionId).then(function(updated){
                });
                app.locals.username = request.body.username;
                response.render("pages/profile", { layout: true, choice: 'profile' });
            } else {
                response.render("pages/index", {layout: false, pageTitle: "User Login and Profile system", _error: "Passwords do not match!" });
            }
        });

    }, function(errorMessage) {
        response.render("pages/index", { layout: false, pageTitle: "User Login and Profile system", _error: errorMessage });
    });
});


app.post("/signup", function (request, response,next) { 
    var hash = bcrypt.hashSync(request.body.pass);
    var usrnm = request.body.username;
    myData.userExists(usrnm).then(function(){
        console.log(request.cookies.currentSessionId);
        myData.createUser(usrnm, hash, Guid.create().toString()).then(function(user){
            console.log("New User="+user.username);
            myData.insertSessionID(user._id,request.cookies.currentSessionId).then(function(updated){
            });
            app.locals.username = request.body.username;
            response.render("pages/dashboard", { layout: true, choice: 'dashboard' });
        }, function(errorMessage){
            response.render("pages/index",{ layout: false, pageTitle: "User Login and Profile system", _error: errorMessage });
        });

        //else render error on home page
    }, function(errorMessage){
         response.render("pages/index", { pageTitle: "User Login and Profile system", _error: errorMessage, layout: false });
    });
});


app.all("/logout", function(request, response){
    console.log("now clearing the cookie");
        
    var expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() -1);
    response.cookie("currentSessionId", "", { expires: expiresAt });
    response.clearCookie("currentSessionId");
    app.locals.username = undefined;
    response.locals.userSession = undefined;
    console.log("Cookies cleared, redirecting to Home");
    response.redirect("/");
});

app.post('/photo',function(request,response){
    upload(request,response,function(err) {
        if(err) {
            //return response.end("Error uploading file.");
            console.log(err);
        }
        //path.join(__dirname, 'path/to/file')
        //res.render("pages/profile", { root: path.join(__dirname, '../public') });
        response.render("pages/profile",{layout: true, choice: 'profile'});
        });
});
// We can now navigate to localhost:3000
app.listen(3000, function () {
    console.log('Your server is now listening on port 3000! Navigate to http://localhost:3000 to access it');
});
