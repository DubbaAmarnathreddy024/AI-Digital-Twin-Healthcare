
from sqlalchemy import inspect

from database.connection import Base, engine
from database import models


def main():
    table_name = "medical_image_analyses"

    # Verify the database connection and existing tables.
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    if table_name in existing_tables:
        print(f"Table '{table_name}' already exists. No changes made.")
        return

    if "medical_images" not in existing_tables:
        raise RuntimeError(
            "Table 'medical_images' does not exist. "
            "Check the database before continuing."
        )

    if "patients" not in existing_tables:
        raise RuntimeError(
            "Table 'patients' does not exist. "
            "Check the database before continuing."
        )

    # Create only the new analysis table.
    models.MedicalImageAnalysis.__table__.create(
        bind=engine,
        checkfirst=True,
    )

    print(f"Successfully created table: {table_name}")


if __name__ == "__main__":
    main()
