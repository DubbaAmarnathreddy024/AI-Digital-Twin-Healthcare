from monitoring.health_monitor import HealthMonitor


monitor = HealthMonitor()


# Controlled test reading
test_reading = {
    "heart_rate": 110,
    "spo2": 93,
    "steps": 5000,
    "sleep_hours": 5.2,
    "calories": 1700
}


alerts = monitor.analyze(test_reading)


print("\n========== ALERT TEST ==========\n")

print("Test Reading:")
print(test_reading)

print("\nAlerts Generated:")

for alert in alerts:
    print(
        f"- {alert['type']}: "
        f"{alert['message']} "
        f"(value={alert['value']})"
    )

print("\nTotal alerts:", len(alerts))