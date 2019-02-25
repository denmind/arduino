/**
DESCRIPTION:

Reads data from the serial stream, if it is a '1' the built-in LED will glow, if it is a '0' the built-in LED will turn off

**/

#define LED LED_BUILTIN
#define BAUD_RATE 9600

void setup() {
  Serial.begin(BAUD_RATE);
  pinMode(LED, OUTPUT);
}

void loop() {
  if(Serial.available() > 0){
    int input = Serial.read() - '0';

    if(input == 1){
      digitalWrite(LED,HIGH);
    }else if(input == 0){
      digitalWrite(LED,LOW);
    }
  }
}