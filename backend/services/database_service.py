from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from alembic import op
import sqlalchemy as sa
from alembic.config import Config
from alembic import command
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/real_estate"
)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

class DatabaseService:
    def __init__(self):
        self.engine = engine
        self.SessionLocal = SessionLocal
        self.Base = Base

    def get_db(self):
        """
        Get database session
        """
        db = self.SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def init_db(self):
        """
        Initialize database
        """
        try:
            # Create all tables
            self.Base.metadata.create_all(bind=self.engine)
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}")
            raise

    def run_migrations(self):
        """
        Run database migrations
        """
        try:
            # Create Alembic configuration
            alembic_cfg = Config("alembic.ini")

            # Run migrations
            command.upgrade(alembic_cfg, "head")
            logger.info("Database migrations completed successfully")
        except Exception as e:
            logger.error(f"Error running database migrations: {str(e)}")
            raise

    def create_migration(self, message: str):
        """
        Create new migration
        """
        try:
            # Create Alembic configuration
            alembic_cfg = Config("alembic.ini")

            # Create new migration
            command.revision(alembic_cfg, message=message, autogenerate=True)
            logger.info(f"Migration created successfully: {message}")
        except Exception as e:
            logger.error(f"Error creating migration: {str(e)}")
            raise

    def rollback_migration(self, revision: str):
        """
        Rollback to specific migration
        """
        try:
            # Create Alembic configuration
            alembic_cfg = Config("alembic.ini")

            # Rollback migration
            command.downgrade(alembic_cfg, revision)
            logger.info(f"Rolled back to migration: {revision}")
        except Exception as e:
            logger.error(f"Error rolling back migration: {str(e)}")
            raise

    def get_migration_history(self):
        """
        Get migration history
        """
        try:
            # Create Alembic configuration
            alembic_cfg = Config("alembic.ini")

            # Get migration history
            history = command.history(alembic_cfg)
            return history
        except Exception as e:
            logger.error(f"Error getting migration history: {str(e)}")
            raise

    def check_connection(self):
        """
        Check database connection
        """
        try:
            # Try to connect to database
            with self.engine.connect() as connection:
                connection.execute("SELECT 1")
            logger.info("Database connection successful")
            return True
        except Exception as e:
            logger.error(f"Database connection failed: {str(e)}")
            return False

    def backup_database(self, backup_path: str):
        """
        Backup database
        """
        try:
            # Create backup directory if it doesn't exist
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)

            # Create backup using pg_dump
            os.system(f"pg_dump -Fc {DATABASE_URL} > {backup_path}")
            logger.info(f"Database backup created successfully: {backup_path}")
        except Exception as e:
            logger.error(f"Error creating database backup: {str(e)}")
            raise

    def restore_database(self, backup_path: str):
        """
        Restore database from backup
        """
        try:
            # Restore database using pg_restore
            os.system(f"pg_restore -d {DATABASE_URL} {backup_path}")
            logger.info(f"Database restored successfully from: {backup_path}")
        except Exception as e:
            logger.error(f"Error restoring database: {str(e)}")
            raise

    def optimize_database(self):
        """
        Optimize database performance
        """
        try:
            # Create database session
            db = self.SessionLocal()

            # Analyze tables
            db.execute("ANALYZE")
            db.commit()

            # Vacuum tables
            db.execute("VACUUM ANALYZE")
            db.commit()

            logger.info("Database optimization completed successfully")
        except Exception as e:
            logger.error(f"Error optimizing database: {str(e)}")
            raise
        finally:
            db.close()

database_service = DatabaseService() 