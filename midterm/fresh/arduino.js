// JavaScript source code
var Serialport = require("serialport").Serialport;
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var path = require("path");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var five = require("johnny-five");
var board = new five.Board();

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/premid.html'));
});

board.on("ready", function () {
    // Create an Led on pin 13
    var self = this;
    self.pinMode(13, 1);
    self.digitalWrite(13, 0); 
   
    app.post('', function (req, res) {
        if (req.body.saba == 1) {
            //console.log("anha");
            self.digitalWrite(13, 1);
        } else {
            self.digitalWrite(13, 0);
        }
    });
});
app.listen(3000);