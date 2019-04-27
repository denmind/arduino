var socket = io();
var max_temp,min_temp,max_humid,min_humid;
var latestAlertTime = 0;
var sounds = new Audio("audio/intro.mp3");

const PWM_HIGH = 255;
const PWM_LOW = 0;
const ALERT_INTERVAL = 4; //Seconds

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

//Changes input value to aid targetting desired value
minTempSlider.oninput = function() {
	let val = this.value;
	
	mintemp.innerHTML = val;
}
maxTempSlider.oninput = function() {
	let val = this.value;
	
	maxtemp.innerHTML = val;
}
minHumSlider.oninput = function() {
	let val = this.value;
	
	minhum.innerHTML = val;
}
maxHumSlider.oninput = function() {
	let val = this.value;
	
	maxhum.innerHTML = val;
}
//Send value of slider by the time the client releases mouse button
minTempSlider.onchange = function() {
	let val = this.value;
	
	if(val < max_temp){
		min_temp = val;
		socket.emit("change-min-temp",min_temp);
	}
}
maxTempSlider.onchange = function() {
	let val = this.value;
	
	if(val > min_temp){
		max_temp = val;
		socket.emit("change-max-temp",max_temp);
	}
}
minHumSlider.onchange = function() {
	let val = this.value;
	
	if(val < max_humid){
		min_humid = val;
		socket.emit("change-min-humid",min_humid);
	}
}
maxHumSlider.onchange = function() {
	let val = this.value;
	
	if(val > min_humid){
		max_humid = val;
		socket.emit("change-max-humid",max_humid);
	}
}
//Alerts
socket.on('alert-message', function (message) {
	let time_interval = timeDiffer(latestAlertTime);
	
	//MGSV
	sounds = new Audio("audio/mgsv/alert.mp3");
	
	//Basic
	//sounds = new Audio("audio/default/alert.mp3");
	
	if(ALERT_INTERVAL < time_interval){
		alertify.error(message);
		sounds.play();
		latestAlertTime = Date.now();
	}
});
function timeDiffer(time_start){
	let differ;
	
	differ = Date.now() - time_start;
	differ = Math.floor(differ/1000);	
	
	return differ;
}
$(document).ready(function(){
	//sounds.play();
	
    $(function(){
        $("[id$='circle']").percircle();
      });
	//Receive extremes from host
	socket.on('extremes',function(TEMP_MAX,TEMP_MIN,HUMID_MAX,HUMID_MIN){
		//Changes display and set extremes for client
		setValues(TEMP_MAX,TEMP_MIN,HUMID_MAX,HUMID_MIN);
 	});
	//Data extracted via AM2302 and the calculated fan speed
	socket.on('readings', function (h,c,f,k,fp,fs) {
		//Change humidity, Fahrenheit, Kelvin
		changeCircles(c,f,k,fp);
		
		//Change humidity
		changeHumidity(h);
		
		//Fan
		changeFan(fp,fs);
    });
	function setValues(max_t,min_t,max_h,min_h){
		//console.log(max_t);console.log(min_t);console.log(max_h);console.log(min_h);
		max_temp = max_t;
		min_temp = min_t;
		max_humid = max_h;
		min_humid = min_h;
		
		document.getElementById("min-temp-host").innerHTML = min_t +" °C";
		document.getElementById("max-temp-host").innerHTML = max_t +" °C";
		document.getElementById("min-hum-host").innerHTML = min_h +"%";
		document.getElementById("max-hum-host").innerHTML =  max_h+"%";
	}
	function changeFan(fan,message){
		let pwm_percent = pwmPercent(fan);
		let pwm_color = "#ff005d";
		
		document.getElementById("fan-speed").innerHTML = "Fan speed is " + message;
		
		$("#pwm_val").percircle({
			text: fan,
			percent: pwm_percent,
			progressBarColor: pwm_color
		});
	}
	//AM2302
	function changeHumidity(humidity){
		let humid_percent = humidityPercent(humidity);
		let humid_color = humidityColor(humidity);
		
		$("#humidity").percircle({
			text: humidity + "%",
			percent: humid_percent,
			progressBarColor: humid_color
		});
	}
	//Percentage and color is based upon set TRUE_TEMP_MAX (70) and TRUE_TEMP_MIN (-30) values for temperature
	function changeCircles(celsius,fahrenheit,kelvin){
		let temp_color = temperatureColor(celsius);
		let temp_percent = temperaturePercent(celsius);
		
		//Change main
		$("#temp_c").percircle({
			text: celsius + " °C",
			percent: temp_percent,
			progressBarColor : temp_color
		});
		//Change other
		$("#temp_f").percircle({
			text: fahrenheit + " °F",
			percent: temp_percent,
			progressBarColor : temp_color
		});
		$("#temp_k").percircle({
			text: kelvin + " K",
			percent: temp_percent,
			progressBarColor : temp_color
		});
	}
	function temperatureColor(celsius){
		let color;
		
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
		else if(celsius >= 60 && celsius < 70)
			color = "#e80611";
		
		return color;
	}
	function pwmPercent(pwm_val){
		let whole = PWM_HIGH;
		
		pwm_val = (pwm_val / whole) * 100;
		pwm_val = parseInt(pwm_val,10);
		
		return pwm_val;
	}
	function temperaturePercent(humidity){
		//e.g. 34.5 = 64.5% OR -29 = 1%
		let whole, new_c;
		
		if(min_temp <= 0){
			new_c = humidity + Math.abs(min_temp);
			whole = max_temp - min_temp;
		}else{
			new_c = humidity;
			whole = max_temp;
		}	
		
		let percent = (new_c / whole) * 100;
		
		if(percent > 100)
			percent = 100;
		else if(percent < 0)
			percent = 0;
		
		percent = parseInt(percent,10);
		
		return percent;
	}
	function humidityColor(humidity){
		let color;
		
		if(humidity >= 0 && humidity < 10)
			color = "#00d0ff";
		else if(humidity >= 10 && humidity < 20)
			color = "#00bbff";
		else if(humidity >= 20 && humidity < 30)
			color = "#00a9ff";
		else if(humidity >= 30 && humidity < 40)
			color = "#0090ff";
		else if(humidity >= 40 && humidity < 50)
			color = "#0077ff";
		else if(humidity >= 50 && humidity < 60)
			color = "#0059ff";
		else if(humidity >= 60 && humidity < 70)
			color = "#0033ff";
		else if(humidity >= 70 && humidity < 60)
			color = "#0000ff";
		else if(humidity >= 80 && humidity < 70)
			color = "#1900ff";
		else if(humidity >= 90 && humidity <= 100)
			color = "#3700ff";
		
		return color;
	}
	function humidityPercent(humidity){
		let whole = max_humid;
		let percent = (humidity / whole) * 100;
		
		if(percent > 100)
			percent = 100;
		else if(percent < 0)
			percent = 0;
		
		percent = parseInt(percent,10);
		
		return percent;
	}
	//Adds support in order for client to change Minimum Input & Maximum Input (Constraints)  
});