import random
import time
from datetime import datetime

from digital_twin.patient_twin import PatientDigitalTwin


class WearableSimulator:

    def __init__(self, twin: PatientDigitalTwin):
        self.twin = twin

        self.steps = 5000
        self.calories = 1700

    def generate_reading(self):

        # Simulated prototype values
        heart_rate = random.randint(60, 100)
        spo2 = random.randint(95, 100)

        self.steps += random.randint(0, 50)
        self.calories += random.randint(0, 5)

        sleep_hours = round(
            random.uniform(6.0, 8.5),
            1
        )

        return {
            "heart_rate": heart_rate,
            "spo2": spo2,
            "steps": self.steps,
            "sleep_hours": sleep_hours,
            "calories": self.calories
        }

    def update_twin(self):

        reading = self.generate_reading()

        self.twin.update_wearable_data(
            heart_rate=reading["heart_rate"],
            spo2=reading["spo2"],
            steps=reading["steps"],
            sleep_hours=reading["sleep_hours"],
            calories=reading["calories"]
        )

        # Store timestamped Digital Twin state
        self.twin.add_health_snapshot()

        return reading


if __name__ == "__main__":

    patient = PatientDigitalTwin(
        patient_id="P001",
        name="Demo Patient",
        age=45,
        sex=1,
        height=172,
        weight=78
    )

    simulator = WearableSimulator(patient)

    print("\n========== WEARABLE SIMULATOR ==========\n")

    # Generate 5 readings for testing
    for i in range(5):

        reading = simulator.update_twin()

        print(
            f"[{datetime.now().strftime('%H:%M:%S')}] "
            f"HR: {reading['heart_rate']} bpm | "
            f"SpO2: {reading['spo2']}% | "
            f"Steps: {reading['steps']} | "
            f"Sleep: {reading['sleep_hours']} h | "
            f"Calories: {reading['calories']}"
        )

        time.sleep(2)

    print("\nTotal snapshots:",
          len(patient.health_history))