//DEPS:
//Serialport: https://serialport.io/docs/en/guide-about
//Johnny-5: http://johnny-five.io/api/board/

//OTHER DEPS:
//https://hackernoon.com/arduino-serial-data-796c4f7d27ce
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

//SERIALPORT
var port = new Serialport('COM3',{
	baudrate : 9600
},/*{autoOpen:false}*/); // <= disables autoOpen if false

//PRELIM
port.write('PORT OPENED!', function(err){
	if(err){
		return console.log('ERR WRITE: ',err.message)
	}
	console.log('Message written')
})

//Read data & display it in console as text
port.on('open', function(){
	console.log('Port COM3 Opened');
	port.on('data', function(data){
		console.log('DATA: ', data)
	})
})

//ERROR EVENT
port.on('error',function(err){
	console.log('ERROR: ',err.message)
})


//Data is readable, then serial stream is now paused
//DATA IS HEXED
// port.on('readable',function(){
	// console.log('Data: ',port.read())
// })

//Switches the port into flowing mod
//DATA IS IN TEXT
// port.on('data', function(data){
	// console.log('Data: ',data)
// })

//DIRECT COMM
board.on("ready", function () {
    // Create an Led on pin 13
	var led_pin = 13;
	
    var self = this;
    self.pinMode(ledBuiltin, 1);
    self.digitalWrite(ledBuiltin, 0); 
   
    //LED CONTROL
    app.post('', function (req, res) {
		var post_data = req.body.saba;
		
        if (post_data == 1) {
            self.digitalWrite(led_pin, 1);
        } else if (post_data == 0){
            self.digitalWrite(led_pin, 0);
        } else if (post_data > 1 && post_data < 255){
			self.analogWrite(led_pin, post_data);
		} else {
			console.log("Data input not in range [0-255]");
		}
    });
});
app.listen(3000);