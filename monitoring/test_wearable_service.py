from digital_twin.patient_twin import PatientDigitalTwin
from monitoring.wearable_service import WearableMonitoringService


def main():

    print("\n========================================")
    print("  WEARABLE DATABASE INTEGRATION TEST")
    print("========================================\n")


    # =====================================================
    # Create Digital Twin
    # =====================================================

    patient = PatientDigitalTwin(
        patient_id="P-FULL-001",
        name="Integration Test Patient",
        age=45,
        sex=1
    )


    print("Patient ID :", patient.patient_id)
    print("Name       :", patient.name)


    # =====================================================
    # Create monitoring service
    # =====================================================

    service = WearableMonitoringService(patient)


    try:

        # Generate and save 5 readings

        for i in range(5):

            result = service.generate_and_save_reading()

            reading = result["reading"]
            alerts = result["alerts"]


            print(
                f"\nReading {i + 1}"
            )

            print(
                f"HR={reading['heart_rate']} | "
                f"SpO2={reading['spo2']} | "
                f"Steps={reading['steps']} | "
                f"Sleep={reading['sleep_hours']} | "
                f"Calories={reading['calories']}"
            )


            if alerts:

                print("Alerts:")

                for alert in alerts:

                    print(
                        f"  - {alert['type']}: "
                        f"{alert['message']} "
                        f"(value={alert['value']})"
                    )

            else:

                print("Alerts: None")


        print("\n========================================")
        print("  DATABASE INTEGRATION SUCCESS")
        print("========================================")


    finally:

        service.close()


if __name__ == "__main__":
    main()