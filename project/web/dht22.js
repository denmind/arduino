var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var path = require("path");
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var five = require("johnny-five");

var board = new five.Board();

//TEMP_MAX & INPUT  user modifiability
//TEMP_MAX is in Celsius change accordingly
var	TEMP_MAX = 40,
	TEMP_MIN = 0,
	c, h, f, k;

//External files
app.use(express.static(path.join(__dirname, 'files')));

//Web
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

board.on("ready", function() {
	const MAX_OUTPUT = 255, //MAXIMUM VALUE FOR ANALOG WRITE VALUE
		  MIN_OUTPUT = 0, //MINIMUM VALUE FOR ANALOG WRITE VALUE
		  TRUE_MAX = 70, //Real maximum reading FOR AM2302
		  TRUE_MIN = -30, //Real minimum reading for AM2302
		  PIN_FAN = 11, //PWM PIN FOR ANALOG OUTPUT
		  PIN_I2C_NANO = 2; //DIGITAL PIN FOR ARDUINO NANO, SEE CIRCUIT FOR DETAILS
		
	//Setup pins & setup fan speed to max to not deter
	//change of fan speed
	this.pinMode(PIN_FAN,five.Pin.PWM);
	this.pinMode(1,five.Pin.ANALOG);
	this.analogWrite(PIN_FAN,MAX_OUTPUT);
	
	var multi = new five.Multi({
		controller: "DHT22_I2C_NANO_BACKPACK",
		pin: PIN_I2C_NANO,
	}); 
  
	var FAN_PWM = 0,
		FAN_SPEED;
	  
	multi.on("change", function() {
		c = this.thermometer.celsius;
		h = this.hygrometer.relativeHumidity;
		f = this.thermometer.fahrenheit;
		k = this.thermometer.kelvin;
		
		//Speed of fan is based upon Celsius
		FAN_PWM = MAX_OUTPUT * (c / TEMP_MAX - TEMP_MIN);
		
		if(FAN_PWM > MAX_OUTPUT)
			FAN_PWM = MAX_OUTPUT;
		else if(FAN_PWM < MIN_OUTPUT)
			FAN_PWM = MIN_OUTPUT;
		
		FAN_PWM = parseInt(FAN_PWM,10);
		
		//FAN_PWM range values' description message
		if(FAN_PWM == MIN_OUTPUT)
			FAN_SPEED = "on halt";
		else if(FAN_PWM > MIN_OUTPUT && FAN_PWM < 51)
			FAN_SPEED = "very slow";
		else if(FAN_PWM > 51 && FAN_PWM < 102)
			FAN_SPEED = "slow";
		else if(FAN_PWM > 102 && FAN_PWM < 149)
			FAN_SPEED = "normal";
		else if(FAN_PWM > 149 && FAN_PWM < 200)
			FAN_SPEED = "fast";
		else if(FAN_PWM > 200 && FAN_PWM < MAX_OUTPUT)
			FAN_SPEED = "very fast";
		else if(FAN_PWM == MAX_OUTPUT)
			FAN_SPEED = "at maximum";
		
		//Checks first if values are valid, since Multi will throw
		//0 C and 0 % Humidity even if DHT22 Sensor is not attached to circuit
		if(c != 0 && h != 0 && f != 32 && k != 273.15){
			//MAIN PROCESS
			//console.log(h + " " + c + " " + f + " " + k + " " + FAN_PWM + " " + FAN_SPEED);
			board.emit('readings',h,c,f,k,FAN_PWM,FAN_SPEED);
		}
	
	//Changes fan speed everytime Multi changes it reading
	board.analogWrite(PIN_FAN,FAN_PWM);
  });
});
io.sockets.on('connection', function (socket) {
	var addr = socket.request.connection.remoteAddress;
	
	//Notify
	console.log("JOINED: ",addr);
	socket.on('disconnect',function(){
		console.log("LEFT: ",addr);
	});
	
	//Data extracted via AM2302 and the calculated fan speed
    board.on('readings', function(h,c,f,k,fp,fs){
        socket.emit('readings',h,c,f,k,fp,fs);
    });
	
	//Adds support in order for client to change
	socket.on('change_max', function(){
		
	});
	socket.on('change_min', function(){
		
	});
});
const port = process.env.PORT || 5008;
server.listen(port);