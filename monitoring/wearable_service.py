from datetime import datetime

from iot.wearable_simulator import WearableSimulator
from monitoring.health_monitor import HealthMonitor
from database.twin_repository import TwinRepository


class WearableMonitoringService:

    def __init__(self, twin):

        self.twin = twin

        self.simulator = WearableSimulator(twin)

        self.monitor = HealthMonitor()

        self.repository = TwinRepository()


    def generate_and_save_reading(self):

        # =====================================================
        # 1. Generate wearable reading
        # =====================================================

        reading = self.simulator.generate_reading()


        # =====================================================
        # 2. Update Digital Twin
        # =====================================================

        self.twin.update_wearable_data(
            heart_rate=reading["heart_rate"],
            spo2=reading["spo2"],
            steps=reading["steps"],
            sleep_hours=reading["sleep_hours"],
            calories=reading["calories"]
        )


        # =====================================================
        # 3. Analyze health data
        # =====================================================

        alerts = self.monitor.analyze(reading)


        # =====================================================
        # 4. Save wearable reading to PostgreSQL
        # =====================================================

        self.repository.save_wearable_data(
            patient_id=self.twin.patient_id,
            wearable_data=reading
        )


        # =====================================================
        # 5. Save generated alerts
        # =====================================================

        for alert in alerts:

            self.repository.save_alert(
                patient_id=self.twin.patient_id,
                alert_type=alert["type"],
                message=alert["message"],
                value=alert.get("value"),
                severity="warning"
            )


        # =====================================================
        # 6. Save Digital Twin health snapshot
        # =====================================================

        self.repository.save_snapshot(
            patient_id=self.twin.patient_id,
            wearable_data=reading,
            ai_predictions=self.twin.ai_predictions
        )


        # =====================================================
        # 7. Commit all database changes
        # =====================================================

        self.repository.commit()


        return {
            "timestamp": datetime.now().isoformat(),
            "reading": reading,
            "alerts": alerts
        }


    def close(self):

        self.repository.close()