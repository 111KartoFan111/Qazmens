from typing import Any, Dict, Optional
from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException, status
from config import settings
import logging
import os
import shutil
from pathlib import Path
import json

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT
)
logger = logging.getLogger(__name__)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify JWT token
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def ensure_directory(directory: str) -> None:
    """
    Ensure directory exists
    """
    Path(directory).mkdir(parents=True, exist_ok=True)

def save_file(file_path: str, content: Any) -> None:
    """
    Save file to disk
    """
    try:
        ensure_directory(os.path.dirname(file_path))
        with open(file_path, 'w') as f:
            if isinstance(content, (dict, list)):
                json.dump(content, f, indent=2)
            else:
                f.write(str(content))
    except Exception as e:
        logger.error(f"Error saving file {file_path}: {str(e)}")
        raise

def load_file(file_path: str) -> Any:
    """
    Load file from disk
    """
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return content
    except Exception as e:
        logger.error(f"Error loading file {file_path}: {str(e)}")
        raise

def backup_file(file_path: str, backup_dir: str = None) -> str:
    """
    Create backup of file
    """
    if backup_dir is None:
        backup_dir = settings.BACKUP_DIR

    try:
        # Create backup directory
        ensure_directory(backup_dir)

        # Generate backup filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"{os.path.basename(file_path)}_{timestamp}"
        backup_path = os.path.join(backup_dir, backup_filename)

        # Copy file
        shutil.copy2(file_path, backup_path)
        logger.info(f"Created backup: {backup_path}")
        return backup_path
    except Exception as e:
        logger.error(f"Error creating backup of {file_path}: {str(e)}")
        raise

def cleanup_old_backups(directory: str = None, days: int = None) -> None:
    """
    Clean up old backup files
    """
    if directory is None:
        directory = settings.BACKUP_DIR
    if days is None:
        days = settings.BACKUP_RETENTION_DAYS

    try:
        cutoff_date = datetime.now() - timedelta(days=days)
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            if os.path.isfile(file_path):
                file_date = datetime.fromtimestamp(os.path.getctime(file_path))
                if file_date < cutoff_date:
                    os.remove(file_path)
                    logger.info(f"Removed old backup: {file_path}")
    except Exception as e:
        logger.error(f"Error cleaning up old backups: {str(e)}")
        raise

def format_currency(amount: float) -> str:
    """
    Format amount as currency
    """
    return f"${amount:,.2f}"

def format_date(date: datetime) -> str:
    """
    Format date
    """
    return date.strftime("%Y-%m-%d %H:%M:%S")

def calculate_percentage(value: float, total: float) -> float:
    """
    Calculate percentage
    """
    if total == 0:
        return 0
    return (value / total) * 100

def validate_file_size(file_size: int) -> bool:
    """
    Validate file size
    """
    return file_size <= settings.MAX_UPLOAD_SIZE

def get_file_extension(filename: str) -> str:
    """
    Get file extension
    """
    return os.path.splitext(filename)[1].lower()

def is_valid_file_type(filename: str, allowed_extensions: list) -> bool:
    """
    Check if file type is allowed
    """
    return get_file_extension(filename) in allowed_extensions

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename
    """
    # Remove invalid characters
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename

def generate_unique_filename(filename: str) -> str:
    """
    Generate unique filename
    """
    name, ext = os.path.splitext(filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{name}_{timestamp}{ext}" 