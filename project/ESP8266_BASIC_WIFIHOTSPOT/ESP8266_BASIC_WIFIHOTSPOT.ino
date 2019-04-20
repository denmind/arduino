#include <ESP8266WiFi.h>

void setup()
{
  Serial.begin(115200);
  Serial.println();

  //SSID NAME AND PASSWORD
  WiFi.begin("GLOBE_MAIN", "normaltext");

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  if(WiFi.status() == WL_CONNECTED){
  Serial.print("Connected, IP address: ");
  Serial.println(WiFi.localIP());
  }
  
}

void loop() {}
