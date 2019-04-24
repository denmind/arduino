#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

/* Set these to your desired credentials. */
const String ssid = "Hot or Cold?";
const String password = "it5008";
const String localhost = "http://localhost:5008/";
const String dns = "hc";

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
  checkConnections();
}
void redirectHost(){
  server.send(200,"text/html","<html><head><meta http-equiv='refresh' content='0; URL="+localhost+"'></head></html>");
}
void blinkLed(){
  digitalWrite(LED_BUILTIN,LOW);
  delay(1000);
  digitalWrite(LED_BUILTIN,HIGH);
  delay(1000);
}
void checkConnections(){
  delay(3000);
  Serial.print("[CLIENTS]: ");
  Serial.println(WiFi.softAPgetStationNum());
}
