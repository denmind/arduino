/**
DESCRIPTION:

Reads data from the serial stream, if it is a '1' the built-in LED will glow, if it is a '0' the built-in LED will turn off

**/

#define BAUD_RATE 9600

#define OUTPUT_PIN LED_BUILTIN //Change to any PWM if analog is used or to LED_BUILTIN if no circuit is present
#define INPUT_PIN

#define ON 1
#define OFF 0
#define MAX 255

void setup() {
  Serial.begin(BAUD_RATE);
  
  pinMode(OUTPUT_PIN, OUTPUT);
}

void loop() {

  if(Serial.available() > 0){

    int input = Serial.readString().toInt();

    
    if(input == "0"){
      digitalWrite(OUTPUT_PIN,HIGH);
      
    }else if(input == "1"){
      digitalWrite(OUTPUT_PIN,LOW);
      
    }else if(input > ON && input <= MAX){
      analogWrite(OUTPUT_PIN,input);
    }
    

  }
}
