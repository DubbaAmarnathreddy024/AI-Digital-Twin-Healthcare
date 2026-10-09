import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base


# Load variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Please check your .env file."
    )


# Create PostgreSQL engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


# Create database session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for SQLAlchemy models
Base = declarative_base()


def get_db():
    """
    Provide a database session for application code.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def test_connection():
    """
    Test the PostgreSQL connection.
    """
    try:
        with engine.connect() as connection:

            result = connection.execute(
                text("SELECT current_database(), version();")
            )

            database_name, version = result.fetchone()

            print("\n========== DATABASE CONNECTION TEST ==========")
            print(f"Connected database : {database_name}")
            print(f"PostgreSQL         : {version}")
            print("Status             : SUCCESS")
            print("================================================")

    except Exception as e:
        print("\n========== DATABASE CONNECTION TEST ==========")
        print("Status             : FAILED")
        print(f"Error              : {e}")
        print("================================================")


if __name__ == "__main__":
    test_connection()