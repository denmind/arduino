var five = require("johnny-five");
var board = new five.Board();


board.on("ready", function() {

  const MAX_OUTPUT = 255, //MAXIMUM VALUE FOR ANALOG WRITE VALUE
		MIN_INPUT = 0,
		PIN_FAN = 11,
		PIN_I2C_NANO = 2;	
		
  //Setup pins & setup fan speed to max to not deter
  //change of fan speed
  this.pinMode(PIN_FAN,five.Pin.PWM);
  this.analogWrite(PIN_FAN,MAX_OUTPUT);
	
  var multi = new five.Multi({
    controller: "DHT22_I2C_NANO_BACKPACK",
    pin: PIN_I2C_NANO,
  });
  
  //MAX_INPUT & INPUT might be supported for user modifiability
  //MAX_INPUT is in Celsius change accordingly
  var MAX_INPUT = 40,
	  FAN_PWM = 0;
	  
  multi.on("change", function() {
	var c = this.thermometer.celsius;
	var h = this.hygrometer.relativeHumidity;
	var f = this.thermometer.fahrenheit;
	var k = this.thermometer.kelvin;
	
	
	
	//Change input variable depending if Celsius, Fahrenheit, or Kelvin is used
	FAN_PWM = MAX_OUTPUT * (c / MAX_INPUT);
	
	if(FAN_PWM > MAX_OUTPUT)
		FAN_PWM = MAX_OUTPUT;
	else if(FAN_PWM < MIN_INPUT)
		FAN_PWM = MIN_INPUT;
	
	//Checks first if values are valid, since AM2302 will throw
	//0 C and 0 % Humidity even if DHT22 Sensor is not attached to circuit
	if(c != 0 && h != 0 && f != 32 && k != 273.15){
		//MAIN PROCESS
		//console.log("H: ",h,"% C: ",c,"°C F: ",f,"°F K: ",k,"K");
		console.log(h,"% ",c,"°C",f,"°F",k,"K === ",FAN_PWM);
	}
	
	board.analogWrite(PIN_FAN,FAN_PWM);
  });
});