#define TRIG_PIN 9
#define ECHO_PIN 10
#define DISTANCE_THRESHOLD 60  // 60 cm (approximately 2 feet)

void setup() {
    Serial.begin(9600);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
}

void loop() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH);
    float distance = duration * 0.034 / 2;  // Convert duration to cm

    // Send "1" if object is closer than 60 cm, otherwise "0"
    if (distance < DISTANCE_THRESHOLD) {
        Serial.println("1");  // Object detected
    } else {
        Serial.println("0");  // No object detected
    }

    delay(5000);  // Adjust based on needs
}