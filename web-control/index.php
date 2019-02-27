<?php
	error_reporting(0);
	
	$led = " ";
	$filename = "arduino.bat";
	$range = (isset($_POST["brightness"])) ? $_POST["brightness"] : 0;
	$exec_file = fopen($filename, "w");
	
	 if(isset($_POST["button_off"])){
		 $exec_file_string = "mode COM3 9600, n, 8, 1, p\nECHO 0 > COM3:";
		 $led = "OFF";
	 }else if(isset($_POST["button_on"])){
		 $exec_file_string = "mode COM3 9600, n, 8, 1, p\nECHO 1 > COM3:";
		 $led = "ON";
	 }else if(isset($range)){
		 $exec_file_string = "mode COM3 9600, n, 8, 1, p\nECHO {$range} > COM3:";
	 }
	 
	 fwrite($exec_file,$exec_file_string);
	 fclose($exec_file);
	 
	 exec("{$filename} 2>&1");
	 
	 
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Arduino | LED Control</title>
		<link rel="stylesheet" type="text/css" href="design.css"> 
    </head>
    <body>
		<div class="square" id="led_control">
			<h1>LED SWITCH CONTROL</h1>
			<p>LED State [0,1]: <?php echo $led; ?>
				<form method = "POST" action="index.php">
					<input type="submit" name="button_on" value="ON">
					<input type="submit" name="button_off" value="OFF">
				</form>
			</p>
		</div>
		<div class="square" id="led_control">
			<h1>LED BRIGHTNESS CONTROL</h1>
			<p> LED Luminosity [0-255]: <?php echo $range; ?>
				<form method = "POST" action="index.php">
					  <input type="range" name="brightness" min="0" max="255" value="0" class="slider" id="myRange"><br>
					<input type="submit" value="GO!">
				</form>
			</p>
		</div>
    </body>
</html>