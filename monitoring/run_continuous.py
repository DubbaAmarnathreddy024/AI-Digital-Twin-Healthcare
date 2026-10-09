import time

from digital_twin.patient_twin import PatientDigitalTwin
from monitoring.wearable_service import WearableMonitoringService


PATIENT_ID = "P-FULL-001"
INTERVAL_SECONDS = 5


def main():

    print("\n==============================================")
    print("   CONTINUOUS WEARABLE MONITORING SERVICE")
    print("==============================================\n")

    patient = PatientDigitalTwin(
        patient_id=PATIENT_ID,
        name="Integration Test Patient",
        age=45,
        sex=1
    )

    service = WearableMonitoringService(patient)

    print("Patient ID :", PATIENT_ID)
    print("Interval   :", f"{INTERVAL_SECONDS} seconds")
    print("\nMonitoring started...")
    print("Press CTRL+C to stop.\n")

    try:

        while True:

            result = service.generate_and_save_reading()

            reading = result["reading"]
            alerts = result["alerts"]

            print("----------------------------------------------")

            print(
                f"HR       : {reading['heart_rate']} bpm"
            )

            print(
                f"SpO2     : {reading['spo2']}%"
            )

            print(
                f"Steps    : {reading['steps']}"
            )

            print(
                f"Sleep    : {reading['sleep_hours']} hours"
            )

            print(
                f"Calories : {reading['calories']}"
            )

            if alerts:

                print("\n⚠ ALERTS:")

                for alert in alerts:

                    print(
                        f"  - {alert['type']}: "
                        f"{alert['message']} "
                        f"(value={alert['value']})"
                    )

            else:

                print("\nAlerts   : None")

            print("----------------------------------------------")

            time.sleep(INTERVAL_SECONDS)

    except KeyboardInterrupt:

        print("\n\nMonitoring stopped by user.")

    finally:

        service.close()

        print("Database connection closed.")
        print("Service stopped.")


if __name__ == "__main__":
    main()