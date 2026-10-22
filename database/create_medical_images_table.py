
from database.connection import Base, engine
from database.models import MedicalImage

def main():
    MedicalImage.__table__.create(bind=engine, checkfirst=True)
    print("Medical images table is ready.")

if __name__ == "__main__":
    main()
