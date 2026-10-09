import time

from iot.wearable_simulator import WearableSimulator
from digital_twin.patient_twin import PatientDigitalTwin


# --------------------------------
# Create patient Digital Twin
# --------------------------------

patient = PatientDigitalTwin(
    patient_id="P001",
    name="Demo Patient",
    age=45,
    sex=1,
    height=172,
    weight=78
)


# --------------------------------
# Create wearable simulator
# --------------------------------

simulator = WearableSimulator(patient)


print("\n========== DIGITAL TWIN MONITORING ==========\n")


# --------------------------------
# Receive wearable readings
# --------------------------------

for i in range(5):

    reading = simulator.generate_reading()

    # Update Digital Twin
    patient.update_wearable_data(
        heart_rate=reading["heart_rate"],
        spo2=reading["spo2"],
        steps=reading["steps"],
        sleep_hours=reading["sleep_hours"],
        calories=reading["calories"]
    )

    # Store snapshot
    patient.add_health_snapshot()

    print(
        f"[{i + 1}] "
        f"HR: {reading['heart_rate']} bpm | "
        f"SpO2: {reading['spo2']}% | "
        f"Steps: {reading['steps']} | "
        f"Sleep: {reading['sleep_hours']} h | "
        f"Calories: {reading['calories']}"
    )

    time.sleep(2)


# --------------------------------
# Final Digital Twin state
# --------------------------------

print("\n========== MONITORING COMPLETE ==========")

print(
    "Total snapshots:",
    len(patient.health_history)
)

print(
    "\nLatest wearable data:"
)

print(patient.wearable_data)