from sqlalchemy import text

from database.connection import engine


def test_connection():
    try:
        with engine.connect() as connection:
            database_name = connection.execute(
                text("SELECT current_database();")
            ).scalar()

            postgres_version = connection.execute(
                text("SELECT version();")
            ).scalar()

        print("\n========== DATABASE CONNECTION TEST ==========")
        print(f"Connected database : {database_name}")
        print(f"PostgreSQL         : {postgres_version}")
        print("Status             : SUCCESS")
        print("================================================")

    except Exception as error:
        print("\n========== DATABASE CONNECTION TEST ==========")
        print("Status : FAILED")
        print(f"Error  : {error}")
        print("================================================")


if __name__ == "__main__":
    test_connection()