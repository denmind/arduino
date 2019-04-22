$(document).ready(function(){
    $(function(){
        $("[id$='circle']").percircle();
      });
	var socket = io();
	var max_temp, min_temp, max_humid, min_humid;
	
	const TRUE_MAX = 70, //Real maximum reading FOR AM2302
		  TRUE_MIN = -30 //Real minimum reading for AM2302
	
	//Data extracted via AM2302 and the calculated fan speed
	socket.on('readings', function (h,c,f,k,fp,fs) {
		//Change Celsius, Fahrenheit, Kelvin
		changeTemp(c,f,k);
		
		//Change humidity
		changeHumidity(h);
		
		//Fan
		describeFanspeed(fs)
    });
	function describeFanspeed(message){
		
	}
	//AM2302
	function changeHumidity(humidity){
		$("#humidity").percircle({
			text: humidity+"%",
			percent: humidity
		});
	}
	//Percentage and color is based upon set TRUE_MAX (70) and TRUE_MIN (-30) values for temperature
	function changeTemp(celsius,fahrenheit,kelvin){
		var temp_color = temperatureColor(celsius);
		var temp_percent = temperaturePercent(celsius);
		
		//Change circles' attribs
		$("#temp_c").percircle({
			text: celsius+"°C",
			percent: temp_percent,
			progressBarColor : temp_color
		});
	}
	//Set color upon celsius range
	function temperatureColor(celsius){
		var color;
		
		if(celsius >= TRUE_MIN && celsius < -20)
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
		else if(celsius >= 60 && celsius < TRUE_MAX)
			color = "#e80611";
		
		return color;
	}
	function temperaturePercent(celsius){
		var whole = TRUE_MAX - TRUE_MIN; //MAX = 70, MIN = -30 hence whole = 100
		//e.g. 34.5 = 64.5% OR -29 = 1%
		var new_c = celsius + Math.abs(TRUE_MIN); //
		var percent = (new_c / whole) * 100;
		
		return percent;
	}
	//Adds support in order for client to change Minimum Input & Maximum Input (Constraints)  
});