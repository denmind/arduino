/**
DESCRIPTION:

Reads data from the serial stream, if it is a '1' the built-in LED will glow, if it is a '0' the built-in LED will turn off

**/

#define BAUD_RATE 9600

#define OUTPUT_PIN 3 //Change to any PWM if analog is used
#define INPUT_PIN

#define ON 1
#define OFF 0
#define MAX 255

String value = "";

void setup() {
  Serial.begin(BAUD_RATE);
  
  pinMode(OUTPUT_PIN, OUTPUT);
}

void loop() {

  if(Serial.available() > 0){

    int input = Serial.readString().toInt();

    if(input == ON){
      digitalWrite(OUTPUT_PIN,HIGH);
      
    }else if(input == OFF){
      digitalWrite(OUTPUT_PIN,LOW);
      
    }else if(input > ON && input < MAX){
      analogWrite(OUTPUT_PIN,input);
    }
    

  }
}
