from database.connection import engine
from database.models import User


print("\n========================================")
print("   HEALTH TWIN AUTH DATABASE SETUP")
print("========================================\n")

User.__table__.create(
    bind=engine,
    checkfirst=True
)

print("Users table ready.")
print("Authentication database setup complete.\n")