  #include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

/* Set these to your desired credentials. */
const String ssid = "Hot or Cold?";
const String password = "it5008";
const String redirect_url = "http://192.168.4.2:5008/";
const String dns = "hc";

const int LED_BLINK_MS = 700;

ESP8266WebServer server(80);

void setup() {

  pinMode(LED_BUILTIN,OUTPUT);
  Serial.begin(115200);
  Serial.println("[CONFIG]");
  
  //WITHOUT security
  WiFi.softAP(ssid);

  //WITH security
  //WiFi.softAP(ssid,password);

  IPAddress myIP = WiFi.softAPIP();
  Serial.println("[HOST]: " + myIP);

  server.on("/",redirectHost);
  server.begin();

  if(MDNS.begin(dns))
    Serial.println("[OK]");
  else
    Serial.println("[ERROR]");
}

void loop() {
  server.handleClient();
  blinkLed();
}
void redirectHost(){
  server.send(200,"text/html","<html><head><meta http-equiv='refresh' content='0; URL="+redirect_url+"'></head></html>");
}
void blinkLed(){
  digitalWrite(LED_BUILTIN,HIGH);
  delay(LED_BLINK_MS);
  digitalWrite(LED_BUILTIN,LOW);
  delay(LED_BLINK_MS);
}
