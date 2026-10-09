from database.connection import engine
from sqlalchemy import text


def main():
    print()
    print("========================================")
    print("       UPDATING AUTH DATABASE")
    print("========================================")
    print()

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                ALTER TABLE users
                ALTER COLUMN patient_id DROP NOT NULL;
                """
            )
        )

    print("users.patient_id is now nullable.")
    print("Auth schema update complete.")
    print()


if __name__ == "__main__":
    main()