# Importing Required Modules
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

# Database URL
DB_URL = "sqlite:///./gst.db"

# Database Engine
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})

# Database Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database Base
Base = declarative_base()

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()