#include <WiFi.h>
#include <HTTPClient.h>
#define TRIG_PIN 12
#define ECHO_PIN 13
#define DISTANCE_THRESHOLD 10  // 60 cm (approximately 2 feet)
#define SENSOR_ID 1
const char* ssid = "VT Open WiFi";      // Replace with your Wi-Fi name
const char* password = "";
const char* serverURL = "http://100.66.204.218:5000/upload";
void setup() {
    Serial.begin(9600);
    delay(1000); // Wait for the serial to initialize
    Serial.println("Starting...");
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    WiFi.begin(ssid, password);  // Connect to Wi-Fi
    Serial.print("Connecting to WiFi...");

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nConnected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

void loop() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH);
    float distance = duration * 0.034 / 2; 
    bool is_occupied = (distance < DISTANCE_THRESHOLD);
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.print(" cm | Occupied: ");
    Serial.println(is_occupied ? "Yes" : "No");
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverURL);
        http.addHeader("Content-Type", "application/json");

        String payload = "{\"sensor_id\": " + String(SENSOR_ID) +
        ", \"distance\": " + String(distance, 2) +
        ", \"is_occupied\": " + (is_occupied ? "true" : "false") + "}";
        
        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.println("Server response: " + response);
        } else {
            Serial.print("Error sending POST: ");
            Serial.println(httpResponseCode);
        }
        http.end();
    } else {
        Serial.println("WiFi not connected.");
    }
    delay(2000); 
}
