from datetime import datetime


class HealthMonitor:

    def __init__(self):

        # Monitoring thresholds for prototype
        self.thresholds = {
            "heart_rate_low": 50,
            "heart_rate_high": 100,
            "spo2_low": 95,
            "sleep_low": 6
        }

    def analyze(self, wearable_data):

        alerts = []

        heart_rate = wearable_data.get("heart_rate")
        spo2 = wearable_data.get("spo2")
        sleep_hours = wearable_data.get("sleep_hours")

        # -----------------------------
        # Heart Rate
        # -----------------------------

        if heart_rate is not None:

            if heart_rate < self.thresholds["heart_rate_low"]:

                alerts.append({
                    "type": "heart_rate",
                    "message": "Heart rate below configured monitoring range",
                    "value": heart_rate,
                    "timestamp": datetime.now().isoformat()
                })

            elif heart_rate > self.thresholds["heart_rate_high"]:

                alerts.append({
                    "type": "heart_rate",
                    "message": "Heart rate above configured monitoring range",
                    "value": heart_rate,
                    "timestamp": datetime.now().isoformat()
                })

        # -----------------------------
        # SpO2
        # -----------------------------

        if spo2 is not None:

            if spo2 < self.thresholds["spo2_low"]:

                alerts.append({
                    "type": "spo2",
                    "message": "SpO2 below configured monitoring threshold",
                    "value": spo2,
                    "timestamp": datetime.now().isoformat()
                })

        # -----------------------------
        # Sleep
        # -----------------------------

        if sleep_hours is not None:

            if sleep_hours < self.thresholds["sleep_low"]:

                alerts.append({
                    "type": "sleep",
                    "message": "Sleep duration below configured monitoring threshold",
                    "value": sleep_hours,
                    "timestamp": datetime.now().isoformat()
                })

        return alerts