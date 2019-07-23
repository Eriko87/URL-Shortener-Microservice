'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const app = express();
const ejs = require('ejs');


// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }, (error, client) => {
	console.log("Successfully connected to MongoDB");
})
app.use(cors());

/** this project needs to parse POST bodies **/
const bodyParser = require('body-parser');
app.set("view engine", "ejs"); 
app.set("views", __dirname + "/views"); 
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
  
//crete model for url data
const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url:{type:String,required:true},
  shortid: { type: Number},
});
let Url = mongoose.model('Url', urlSchema);

//for for shortid. it will be incremented by 1 every time we see a new url
let number = 0

//Look for existing url info first, then create new url record
app.post('/api/shorturl/new', (req, res) => {
let originalUrl = req.body.url;  

Url.findOne( {original_url: req.body.url}, function (err, data) {
  let foundUrl
  let foundNumber
    if (err) {
            throw err
          } else {
            if(!data){
              //create new url
              number = number + 1;
              let newUrl = new Url({
              original_url:originalUrl,
              shortid: parseInt(number),
              });
  
            //save new url
             newUrl.save(function(err, data){
               if (err)
                 throw err
               });
              foundUrl = newUrl.original_url;
              foundNumber = newUrl.shortid;
            } else{
              foundUrl = data.original_url;
              foundNumber = data.shortid;
            }
          }   

  res.render('index.ejs', { 
     foundUrl : "Submitted URL: " + foundUrl, 
     foundNumber: "https://url-mall.glitch.me/api/shorturl/new/"+ foundNumber});
    });
})



//find url in the db by shortid and redirect to the saved url
app.get('/api/shorturl/new/:number?', function(req, res){
  let number = req.params.number  
 Url.findOne( {shortid: number}, function (err, data) {
    if (err) {
            throw err
          } else {
            let redirectUrl = data.original_url
            res.redirect(redirectUrl);
          }   
    });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
