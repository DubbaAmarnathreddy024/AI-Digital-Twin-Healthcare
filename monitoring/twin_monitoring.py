import time

from iot.wearable_simulator import WearableSimulator
from digital_twin.patient_twin import PatientDigitalTwin
from monitoring.health_monitor import HealthMonitor


# Create Digital Twin
patient = PatientDigitalTwin(
    patient_id="P001",
    name="Demo Patient",
    age=45,
    sex=1,
    height=172,
    weight=78
)

# Create wearable simulator
simulator = WearableSimulator(patient)

# Create health monitor
monitor = HealthMonitor()

print("\n========== AI DIGITAL TWIN MONITORING ==========\n")


for i in range(10):

    # Generate wearable reading
    reading = simulator.generate_reading()

    # Update Digital Twin
    patient.update_wearable_data(
        heart_rate=reading["heart_rate"],
        spo2=reading["spo2"],
        steps=reading["steps"],
        sleep_hours=reading["sleep_hours"],
        calories=reading["calories"]
    )

    # Analyze reading
    alerts = monitor.analyze(patient.wearable_data)

    # Store alerts
    for alert in alerts:
        patient.add_alert(alert)

    # Store health snapshot
    patient.add_health_snapshot()

    print(
        f"[{i + 1}] "
        f"HR: {reading['heart_rate']} bpm | "
        f"SpO2: {reading['spo2']}% | "
        f"Steps: {reading['steps']} | "
        f"Sleep: {reading['sleep_hours']} h"
    )

    if alerts:
        print("  ⚠ ALERTS:")

        for alert in alerts:
            print(
                f"   - {alert['type']}: "
                f"{alert['message']} "
                f"(value={alert['value']})"
            )
    else:
        print("  ✓ No monitoring alerts")

    print()

    time.sleep(2)


print("========== MONITORING COMPLETE ==========")

print("Health snapshots:", len(patient.health_history))

print("Total alerts:", len(patient.alerts))

print("\nLatest wearable data:")

print(patient.wearable_data)