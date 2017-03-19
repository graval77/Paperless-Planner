var MongoClient = require('mongodb').MongoClient,
settings = require('./config.js'),
Guid = require('Guid');

var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl)
.then(function(db) {
    var myCollection = db.collection("user_collection");
    var myApplicationCollection = db.collection("application_collection");
    
    // setup your exports!
    
    exports.getUser = function(_username){          
        return myCollection.find({ username: _username }).limit(1).toArray().then(function(user) {
            if (user.length === 0) return Promise.reject("Username : \'" +_username +"\' not found!");
            return user[0];
        });
    };

    exports.getUserFromID = function(id){            
        return myCollection.find({ _id: id }).limit(1).toArray().then(function(user) {
            if (user.length === 0) return Promise.reject("No user found");
            return user[0];
        });
    };

    exports.getUserFromSessionID = function(sessionID){            
        return myCollection.find({ currentSessionId: sessionID }).limit(1).toArray().then(function(user) {
            if (user.length === 0) return Promise.reject("No user found");
            return user[0];
        });
    };

    exports.createUser = function(_username, pass_hash){        
        var user = {
            _id : Guid.create().toString(),
            username: _username,
            encryptedPassword: pass_hash,
            currentSessionId: '',
            user_status:'',
            last_visited:'',
            profile: {
                firstName: '',
                lastName: '',
                emailId: '',
                photo: '',
                resume:'',
                education:'',
                skills:'',
                experience:''
            },
        };

        return myCollection.find({ username: _username }).limit(1).toArray().then(function(user_found) {
            if (user_found.length !== 0) 
            return Promise.reject("Username : \'" +_username +"\' already exists! Try a different username!");
            
            return myCollection.insertOne(user).then(function (newUser) {
                return newUser.insertedId;
            }).then(function(user_id){
                return exports.getUserFromID(user_id)
            });
        });

    };
    exports.userExists = function(uname){
            console.log("in userExists");
            if(!uname) return Promise.reject("Missing Uname");
            
            return myCollection.find({'username': uname}).limit(1).toArray().then(function(userList){
                console.log("userlist length"+userList.length)
                if(userList.length === 0)
                    {
                        console.log("no user");
                        return true;
                    } 
                else return Promise.reject("Username already taken.");
            });
    };
    exports.updateUser = function(_sessionID, _profile){            
        return myCollection.updateOne({ currentSessionId: _sessionID }, { $set: { "profile": _profile } }).then(function() {
            return exports.getUserFromSessionID(_sessionID);
        });
    };

    exports.insertSessionID = function(_userID, sessionID){            
        return myCollection.updateOne({ _id: _userID }, { $set: { "currentSessionId": sessionID } }).then(function() {
            return exports.getUserFromID(_userID);
        });
    };

    exports.clearSessionID = function(sessionID){           
        return myCollection.updateOne({ currentSessionId: sessionID }, { $set: { "currentSessionId": "" } });
    };
    //Shristi
    exports.getApplication = function(id) {
        if (id === undefined) return Promise.reject("You must provide an ID");

        return myApplicationCollection.find({ _id: id }).limit(1).toArray().then(function(listOfApplications) {
            if (listOfApplications.length === 0) throw "Could not find application with id of " + id;
            return listOfApplications[0];
        });
    };
    exports.insertForm_forUser = function(_username,_currentSession,_company,_contact,_email,_appliedOn,_status,_site,_skillsRequired,_note,_followUpOn,_remind)
    {   var newApplication =    {
                                    _id: Guid.create().toString(),
                                    "creator":_username,
                                    "company":_company,
                                    "contact":_contact,
                                    "email":_email,
                                    "appliedOn": new Date(_appliedOn),
                                    "status":_status,
                                    "site":_site,
                                    "skillsRequired":_skillsRequired,
                                    "note":_note,
                                    "followUpOn":new Date(_followUpOn),
                                    "remind":new Date(_remind)
                                }
        return myApplicationCollection.insertOne(newApplication).then(function (newApplication) {
                return newApplication.insertedId;
        });
    };

    exports.getUserByCredentials = function(username, password){
        console.log("in getUserByCredentials, username="+username+" ,password="+password);
        if(!username) return Promise.reject("You must provide an Username");
        if(!password) return Promise.reject("You must provide an password");

        return myCollection.find({"username": username}).limit(1).toArray().then(function(listOfUsers){
            console.log("listOfUsers.length= "+listOfUsers.length);
            if(listOfUsers.length === 0) {
                console.log("could not find user with the username of "+Username);
                return Promise.reject('could not find user with the username of '+username);
            }

            return listOfUsers[0];
        });
    };
        //Shristi
    exports.getApplications = function(username) {
        if (username === undefined)
        {   
            console.log("error")
            return Promise.reject("You must provide an Username");
        } 

        return  myApplicationCollection.find({ "creator" : username }).toArray().then(function(applicationList) {
            console.log('application'+applicationList.length);
            return applicationList;
        });
    }

    
});
