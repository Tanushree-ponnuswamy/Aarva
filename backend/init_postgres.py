"""
init_postgres.py
Run once to create all tables in PostgreSQL and seed demo data.
Usage:  python init_postgres.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database.postgres import init_db, engine
from models.models import Base

if __name__ == "__main__":
    print("[INIT] Creating all PostgreSQL tables …")
    Base.metadata.create_all(bind=engine)
    print("[OK]  Tables created.")
    print("[SEED] Seeding demo data …")
    from database.postgres import seed_demo_data
    seed_demo_data()
    print("[DONE] PostgreSQL is ready.")
