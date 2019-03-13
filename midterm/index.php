<?php
	require 'PhpSerial.php';
	//error_reporting(0);
	
	$serial = new PhpSerial;
	
	//Configs
	$serial->deviceSet("COM3");
	
	$serial->confBaudRate(9600);
	$serial->confParity("n");
	$serial->confCharacterLength(8);
	$serial->confStopBits(1);
	$serial->confFlowControl("none");
	
	$serial->deviceOpen();
	
	//Serial Php
	
	$data = "";
	$led = "";
	
	
	if(isset($_POST["button_off"])){
		$data = $led = "0";
	 }else if(isset($_POST["button_on"])){
		 $data = $led = "1";
	 }else if($_POST["brightness"] >= 0 && $_POST["brightness"] <= 255){
		$data = $led = $_POST["brightness"];
	 }
	 print_r($data);
	 $serial->sendMessage($data);
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Arduino Web Control</title>
    </head>
    <body>
			<h2>LED DIGITAL SWITCH</h2>
			<p>LED State [0,1]
				<form method = "POST" action="index.php">
					<input type="submit" name="button_on" value="ON">
					<input type="submit" name="button_off" value="OFF">
				</form>
			</p>
		</div>
			<h2>LED BRIGHTNESS CONTROL</h2>
			<p> LED Luminosity [0-255]
				<form method = "POST" action="index.php" autocomplete="off">
					  <input type="text" name="brightness">
					<input type="submit" value="GO!">
				</form>
			</p>
    </body>
</html>