var express = require("express");
var app = express();
var path = require("path");
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var five = require("johnny-five");

var board = new five.Board();

const MAX_OUTPUT = 255, //MAXIMUM VALUE FOR ANALOG WRITE VALUE
	  MIN_OUTPUT = 0, //MINIMUM VALUE FOR ANALOG WRITE VALUE
	  PIN_FAN = 11, //PWM PIN FOR ANALOG OUTPUT
	  PIN_I2C_NANO = 2; //DIGITAL PIN FOR ARDUINO NANO, SEE CIRCUIT FOR DETAILS
	  TRUE_TEMP_MAX = 70, //Real maximum reading FOR AM2302
	  TRUE_TEMP_MIN = -30, //Real minimum reading for AM2302
	  TRUE_HUMID_MAX = 100,
	  TRUE_HUMID_MIN = 0,
	  HOST_PORT = 5008;
	  
//TEMP_MAX & INPUT  user modifiability
//TEMP_MAX is in humidity change accordingly
var	TEMP_MAX = 35,
	TEMP_MIN = 0,
	HUMID_MAX = TRUE_HUMID_MAX,
	HUMID_MIN = TRUE_HUMID_MIN,
	c, h, f, k;

//Additional files
app.use(express.static(path.join(__dirname, 'files')));

//Web
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

board.on("ready", function() {
	this.pinMode(PIN_FAN,five.Pin.PWM);
	this.pinMode(1,five.Pin.ANALOG);
	
	let multi = new five.Multi({
		controller: "DHT22_I2C_NANO_BACKPACK",
		pin: PIN_I2C_NANO,
	}); 
  
	let FAN_PWM = 0,
		FAN_SPEED;
	  
	multi.on("change", function() {
		c = this.thermometer.celsius;
		h = this.hygrometer.relativeHumidity;
		f = this.thermometer.fahrenheit;
		k = this.thermometer.kelvin;
		
		//Speed of fan is based upon humidity
		FAN_PWM = MAX_OUTPUT * (c / TEMP_MAX);
		
		if(FAN_PWM > MAX_OUTPUT)
			FAN_PWM = MAX_OUTPUT;
		else if(FAN_PWM < MIN_OUTPUT)
			FAN_PWM = MIN_OUTPUT;
		
		//Convert to integer base-10
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
		else if(FAN_PWM > 200 && FAN_PWM < 255)
			FAN_SPEED = "very fast";
		else if(FAN_PWM == MAX_OUTPUT)
			FAN_SPEED = "at maximum";
		
		//Checks first if values are valid, since Multi will throw
		//0 C and 0 % Humidity even if DHT22 Sensor is not attached to circuit
		if(c != 0 && h != 0 && f != 32 && k != 273.15){
			//console.log(h + " " + c + " " + f + " " + k + " " + FAN_PWM + " " + FAN_SPEED);
			
			//Checks if any reading goes beyond/below extreme values
			//Temperature checkpoint
			//Note that event is triggered with a top-down order
			//Meaning, max-temp > min-temp > max-humid > min-humid
			if(c >= TEMP_MAX)
				board.emit('alert-max-temp',c,TEMP_MAX);
			else if(c <= TEMP_MIN)
				board.emit('alert-min-temp',c,TEMP_MIN);
			
			//Humidity checkpoint
			if(h >= HUMID_MAX)
				board.emit('alert-max-humid',h,HUMID_MAX);
			else if(h <= HUMID_MIN)
				board.emit('alert-min-humid',h,HUMID_MIN);
			
			board.emit('readings',h,c,f,k,FAN_PWM,FAN_SPEED);
		}
	//Changes fan speed everytime Multi changes it reading
	board.analogWrite(PIN_FAN,FAN_PWM);
  });
});
io.sockets.on('connection', function (socket) {
	//Get address of connection
	let addr = socket.request.connection.remoteAddress;
	
	//Send extreme values to client on connect
    socket.emit("extremes",TEMP_MAX,TEMP_MIN,HUMID_MAX,HUMID_MIN);
	//console.log(TEMP_MAX);console.log(TEMP_MIN);console.log(HUMID_MAX);console.log(HUMID_MIN);
	
	//Notify host every time any client connects/disconnects
	console.log("JOINED: ",addr);
	socket.on('disconnect',function(){
		console.log("LEFT: ",addr);
	});
	
	//Data extracted via AM2302, the calculated fan speed and the corresponding description
    board.on('readings', function(h,c,f,k,fp,fs){
        socket.emit('readings',h,c,f,k,fp,fs);
    });
	//Send alert event everytime any reading is beyond/below extreme value
	board.on('alert-max-humid', function(reading,extreme){
		let message = getDateTimestamp();
		let value = reading - extreme;
		
		value = Math.round(value * 10) / 10;
		
		//Change = to += and vice-versa to include/exclude timestamp;
		if(0 == value)
			message = "Humidity is at maximum set level";
		else
			message = "Humidity exceeds maximum set level by " + value + "%";
		
        socket.emit('alert-message',message);
    });
	board.on('alert-min-humid', function(reading,extreme){
		let message = getDateTimestamp();
		let value = reading - extreme;
		
		value = Math.round(value * 10) / 10;
		
		//Change = to += and vice-versa to include/exclude timestamp;
		if(0 == value)
			message = "Humidity is at minimum set level";
		else
			message = "Humidity falls below minimum set level by " + value + "%";
		
		socket.emit('alert-message',message);
    });
	board.on('alert-max-temp', function(reading,extreme){
		let message = getDateTimestamp();
		let value = reading - extreme;
		
		value = Math.round(value * 10) / 10;
		
		//Change = to += and vice-versa to include/exclude timestamp;
		if(0 == value)
			message = "Temperature is at maximum set level";
		else
			message = "Temperature exceeds maximum set level by " + value +" °C";
		
        socket.emit('alert-message',message);
    });
	board.on('alert-min-temp', function(reading,extreme){
		let message = getDateTimestamp();
		let value = reading - extreme;

		value = Math.round(value * 10) / 10;
		
		//Change = to += and vice-versa to include/exclude timestamp;
		if(0 == value)
			message = "Temperature is at minimum set level";
		else
			message = "Temperature falls below minimum set level by " + value +" °C";
		
        socket.emit('alert-message',message);
    });
	//Adds support in order for client to change extreme values
	//Checks first if data received from client is within logical case host side
	//Humidity
	socket.on('change-min-humid',function(value){
		if(value >=  TRUE_HUMID_MIN && value <= TRUE_HUMID_MAX){
			HUMID_MIN = value;
			console.log("MIN Humidity changed to " + value + " by " + addr);
			socket.emit("extremes",TEMP_MAX,TEMP_MIN,HUMID_MAX,HUMID_MIN);
		}
	});
	socket.on('change-max-humid',function(value){
		if(value >=  TRUE_HUMID_MIN && value <= TRUE_HUMID_MAX){
			HUMID_MAX = value;
			console.log("MAX Humidity changed to " + value + " by " + addr);
			socket.emit("extremes",TEMP_MAX,TEMP_MIN,HUMID_MAX,HUMID_MIN);
		}
	});
	//Temperature
	socket.on('change-min-temp',function(value){
		if(value >=  TRUE_TEMP_MIN && value <= TRUE_TEMP_MAX){
			TEMP_MIN = value;
			console.log("MIN Temperature changed to " + value + " by " + addr);
			socket.emit("extremes",TEMP_MAX,TEMP_MIN,HUMID_MAX,HUMID_MIN);	
		}
	});
	socket.on('change-max-temp',function(value){
		if(value >=  TRUE_TEMP_MIN && value <= TRUE_TEMP_MAX){
			TEMP_MAX = value;
			console.log("MAX Temperature changed to " + value + " by " + addr);
			socket.emit("extremes",TEMP_MAX,TEMP_MIN,HUMID_MAX,HUMID_MIN);
		}
	});
});
function getDateTimestamp(){
	const monthList = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	let date = new Date();
    let monthNo = date.getMonth();
    let day = date.getDate();
    let year = date.getFullYear();
    let whole_date = monthList[monthNo] + " " + day + ', ' + year;
	
	//include/exclude parameter for toLocaleTimeString to include/exclude seconds digit
	
	let whole_time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
	
	whole_date += " " + whole_time;
	
	return whole_date;
}
const port = process.env.PORT || HOST_PORT;
server.listen(port);