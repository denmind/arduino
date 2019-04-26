var socket = io();
var max_temp,min_temp,max_humid,min_humid;

const PWM_HIGH = 255;
const PWM_LOW = 0;

var minTempSlider = document.getElementById("min-temp-range");
var maxTempSlider = document.getElementById("max-temp-range");
var minHumSlider = document.getElementById("min-hum-range");
var maxHumSlider = document.getElementById("max-hum-range");
var mintemp = document.getElementById("min-temp");
var maxtemp = document.getElementById("max-temp");
var minhum = document.getElementById("min-hum");
var maxhum = document.getElementById("max-hum");

mintemp.innerHTML = minTempSlider.value;
maxtemp.innerHTML = maxTempSlider.value;
minhum.innerHTML = minHumSlider.value;
maxhum.innerHTML = maxHumSlider.value;

//Client concerns
minTempSlider.oninput = function() {
	var val = this.value;
	
	if(val < max_temp){
		mintemp.innerHTML = val;
	}
}
maxTempSlider.oninput = function() {
	var val = this.value;
	
	if(val > min_temp){
		maxtemp.innerHTML = this.value;
	}
}
minHumSlider.oninput = function() {
	var val = this.value;
	
	if(val < max_humid){
		minhum.innerHTML = val;
	}
}
maxHumSlider.oninput = function() {
	var val = this.value;
	
	if(val > min_humid){
		maxhum.innerHTML = this.value;
	}
}

//Broadcast "extremes-max/min-temp/humid"
minTempSlider.onchange = function() {
}
maxTempSlider.onchange = function() {
}
minHumSlider.onchange = function() {
}
maxHumSlider.onchange = function() {
}

$(document).ready(function(){
    $(function(){
        $("[id$='circle']").percircle();
      });
	//Receive values from host
	socket.on('extremes',function(TEMP_MAX,TEMP_MIN,HUMID_MAX,HUMID_MIN){
		//Change display values for client
		setValues(TEMP_MAX,TEMP_MIN,HUMID_MAX,HUMID_MIN);
 	});
	//Data extracted via AM2302 and the calculated fan speed
	socket.on('readings', function (h,c,f,k,fp,fs) {
		//Change Celsius, Fahrenheit, Kelvin
		changeCircles(c,f,k,fp);
		
		//Change humidity
		changeHumidity(h);
		
		//Fan
		describeFanspeed(fs);
		
    });
	function setValues(max_t,min_t,max_h,min_h){
		//console.log(max_t);console.log(min_t);console.log(max_h);console.log(min_h);
		max_temp = max_t;
		min_temp = min_t;
		max_humid = max_h;
		min_humid = min_h;
		
		document.getElementById("min-temp-host").innerHTML = max_t +" °C";
		document.getElementById("max-temp-host").innerHTML = min_t +" °C";
		document.getElementById("min-hum-host").innerHTML = min_h +"%";
		document.getElementById("max-hum-host").innerHTML =  max_h+"%";
	}
	function describeFanspeed(message){
		document.getElementById("fan-speed").innerHTML = "Fan speed is " + message;
	}
	//AM2302
	function changeHumidity(humidity){
		$("#humidity").percircle({
			text: humidity+"%",
			percent: humidity
		});
	}
	//Percentage and color is based upon set TRUE_TEMP_MAX (70) and TRUE_TEMP_MIN (-30) values for temperature
	function changeCircles(celsius,fahrenheit,kelvin,fan){
		var temp_color = temperatureColor(celsius);
		var temp_percent = temperaturePercent(celsius);
		var pwm_percent = pwmPercent(fan);
		var pwm_color = "#ff005d";
		
		//Change circles' attribs
		$("#temp_c").percircle({
			text: celsius+" °C",
			percent: temp_percent,
			progressBarColor : temp_color
		});
		
		//Change other circles
		$("#temp_f").percircle({
			text: fahrenheit+" °F",
			percent: temp_percent,
			progressBarColor : temp_color
		});
		$("#temp_k").percircle({
			text: kelvin+" K",
			percent: temp_percent,
			progressBarColor : temp_color
		});
		$("#pwm_val").percircle({
			text: fan,
			percent: pwm_percent,
			progressBarColor: pwm_color
		});
		//console.log("PWM: " + pwm_percent + "TEMP: " + temp_percent);
	}
	//Set color upon celsius range
	function temperatureColor(celsius){
		var color;
		
		if(celsius >= -30 && celsius < -20)
			color = "#00183e";
		else if(celsius >= -20 && celsius < -10)
			color = "#3a77ae";
		else if(celsius >= -10 && celsius < 0)
			color = "#a6cae4";
		else if(celsius >= 0 && celsius < 10)
			color = "#fef663";
		else if(celsius >= 10 && celsius < 20)
			color = "#fff20e";
		else if(celsius >= 20 && celsius < 30)
			color = "#f7b006";
		else if(celsius >= 30 && celsius < 40)
			color = "#ef710b";
		else if(celsius >= 40 && celsius < 50)
			color = "#eb520e";
		else if(celsius >= 50 && celsius < 60)
			color = "#e73a10";
		else if(celsius >= 60 && celsius < -70)
			color = "#e80611";
		
		return color;
	}
	function pwmPercent(pwm_val){
		var whole = PWM_HIGH - PWM_LOW;
		
		pwm_val = (pwm_val / whole) * 100;
		pwm_val = parseInt(pwm_val,10);
		
		return pwm_val;
	}
	function temperaturePercent(celsius){
		var whole = max_temp - min_temp;
		//e.g. 34.5 = 64.5% OR -29 = 1%
		var new_c = celsius + Math.abs(min_temp); //
		var percent = (new_c / whole) * 100;
		
		if(percent > 100)
			percent = 100;
		
		percent = parseInt(percent,10);
		
		return percent;
	}
	//Adds support in order for client to change Minimum Input & Maximum Input (Constraints)  
});