from digital_twin.patient_twin import PatientDigitalTwin
from digital_twin.twin_prediction import update_heart_disease_prediction
from iot.wearable_simulator import WearableSimulator
from monitoring.health_monitor import HealthMonitor

from database.twin_repository import TwinRepository


def main():

    print("\n")
    print("======================================================")
    print("       AI DIGITAL TWIN - FULL INTEGRATION TEST")
    print("======================================================")

    repository = TwinRepository()

    try:

        # =====================================================
        # 1. CREATE DIGITAL TWIN
        # =====================================================

        twin = PatientDigitalTwin(
            patient_id="P-FULL-001",
            name="Integration Test Patient",
            age=45,
            sex=1
        )

        print("\n[1] Digital Twin")
        print(f"    Patient ID : {twin.patient_id}")
        print(f"    Name       : {twin.name}")
        print(f"    Age        : {twin.demographics.get('age')}")
        print(f"    Sex        : {twin.demographics.get('sex')}")

        # =====================================================
        # 2. ADD CLINICAL DATA
        # =====================================================

        twin.update_clinical_data(
            cp=3,
            trestbps=130,
            chol=220,
            fbs=0,
            restecg=0,
            thalach=160,
            exang=0,
            oldpeak=1.0,
            slope=2,
            ca=0,
            thal=3
        )

        print("\n[2] Clinical Data")
        print("    ✓ Clinical data added")

        # =====================================================
        # 3. FIND OR CREATE PATIENT
        # =====================================================

        patient = repository.get_patient_by_id(
            twin.patient_id
        )

        if patient:

            print("\n[3] PostgreSQL")
            print("    ✓ Existing patient found")
            print(f"    Database ID: {patient.id}")

        else:

            patient = repository.create_patient(twin)

            print("\n[3] PostgreSQL")
            print("    ✓ New patient created")
            print(f"    Database ID: {patient.id}")

        # =====================================================
        # 4. SAVE CLINICAL DATA
        # =====================================================

        repository.save_clinical_data(
            patient.id,
            twin.clinical_data
        )

        print("    ✓ Clinical data saved")

        # =====================================================
        # 5. RUN AI PREDICTION
        # =====================================================

        prediction = update_heart_disease_prediction(twin)

        print("\n[4] AI Disease Prediction")
        print(f"    Prediction : {prediction['prediction']}")
        print(f"    Probability: {prediction['probability']:.4f}")
        print(f"    Risk Level : {prediction['risk_level']}")

        # =====================================================
        # 6. SAVE AI PREDICTION
        # =====================================================

        repository.save_prediction(
            patient.id,
            "Heart Disease",
            prediction
        )

        print("    ✓ AI prediction saved")

        # =====================================================
        # 7. CREATE WEARABLE SIMULATOR
        # =====================================================

        simulator = WearableSimulator(twin)

        monitor = HealthMonitor()

        print("\n[5] Wearable Monitoring")

        generated_alerts = 0

        # =====================================================
        # 8. GENERATE WEARABLE DATA
        # =====================================================

        for i in range(5):

            reading = simulator.generate_reading()

            # -------------------------------------------------
            # Update Digital Twin
            # -------------------------------------------------

            twin.update_wearable_data(**reading)

            # -------------------------------------------------
            # Health monitoring
            # -------------------------------------------------

            alerts = monitor.analyze(reading)

            print(
                f"    Reading {i + 1}: "
                f"HR={reading['heart_rate']} | "
                f"SpO2={reading['spo2']} | "
                f"Steps={reading['steps']} | "
                f"Sleep={reading['sleep_hours']}"
            )

            # -------------------------------------------------
            # Save wearable data
            # -------------------------------------------------

            repository.save_wearable_data(
                patient.id,
                reading
            )

            # -------------------------------------------------
            # Save alerts
            # -------------------------------------------------

            for alert in alerts:

                generated_alerts += 1

                print(f"      ⚠ Alert: {alert}")

                if isinstance(alert, dict):

                    repository.save_alert(
                        patient.id,
                        alert.get(
                            "type",
                            "monitoring"
                        ),
                        alert.get(
                            "message",
                            str(alert)
                        ),
                        alert.get("value"),
                        "warning"
                    )

                else:

                    repository.save_alert(
                        patient.id,
                        "monitoring",
                        str(alert),
                        None,
                        "warning"
                    )

            # -------------------------------------------------
            # Digital Twin health snapshot
            # -------------------------------------------------

            twin.add_health_snapshot()

            repository.save_snapshot(
                patient.id,
                clinical_data=twin.clinical_data,
                wearable_data=twin.wearable_data,
                lab_results=twin.lab_results,
                ai_predictions=twin.ai_predictions
            )

        # =====================================================
        # 9. COMMIT EVERYTHING
        # =====================================================

        repository.commit()

        print("\n[6] Database Commit")
        print("    ✓ All data committed to PostgreSQL")

        # =====================================================
        # 10. FINAL RESULT
        # =====================================================

        print("\n======================================================")
        print("              FULL INTEGRATION SUCCESS")
        print("======================================================")

        print(f"Patient ID       : {twin.patient_id}")
        print(f"Database ID      : {patient.id}")
        print(f"AI Risk Level    : {prediction['risk_level']}")
        print(f"AI Probability   : {prediction['probability']:.4f}")
        print("Wearable Readings: 5")
        print(f"Alerts Generated : {generated_alerts}")
        print("Database Status  : SAVED")

        print("======================================================")

    except Exception as e:

        repository.rollback()

        print("\n======================================================")
        print("              FULL INTEGRATION FAILED")
        print("======================================================")

        print(f"Error: {e}")

        print("======================================================")

    finally:

        repository.close()


if __name__ == "__main__":
    main()