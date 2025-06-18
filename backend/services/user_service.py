from sqlalchemy.orm import Session
from typing import Optional
import models
import schemas
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import os

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserService:
    def create_user(
        self,
        db: Session,
        user: schemas.UserCreate
    ) -> models.User:
        """
        Create a new user
        """
        # Check if user already exists
        db_user = self.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Create new user
        hashed_password = pwd_context.hash(user.password)
        db_user = models.User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            full_name=user.full_name,
            role=user.role,
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def get_user(
        self,
        db: Session,
        user_id: int
    ) -> Optional[models.User]:
        """
        Get user by ID
        """
        return db.query(models.User).filter(models.User.id == user_id).first()

    def get_user_by_email(
        self,
        db: Session,
        email: str
    ) -> Optional[models.User]:
        """
        Get user by email
        """
        return db.query(models.User).filter(models.User.email == email).first()

    def get_users(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> list[models.User]:
        """
        Get list of users
        """
        return db.query(models.User).offset(skip).limit(limit).all()

    def update_user(
        self,
        db: Session,
        user_id: int,
        user_update: schemas.UserUpdate
    ) -> Optional[models.User]:
        """
        Update user information
        """
        db_user = self.get_user(db, user_id)
        if not db_user:
            return None

        update_data = user_update.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = pwd_context.hash(update_data.pop("password"))

        for field, value in update_data.items():
            setattr(db_user, field, value)

        db.commit()
        db.refresh(db_user)
        return db_user

    def delete_user(
        self,
        db: Session,
        user_id: int
    ) -> bool:
        """
        Delete user
        """
        db_user = self.get_user(db, user_id)
        if not db_user:
            return False

        db.delete(db_user)
        db.commit()
        return True

    def authenticate_user(
        self,
        db: Session,
        email: str,
        password: str
    ) -> Optional[models.User]:
        """
        Authenticate user
        """
        user = self.get_user_by_email(db, email)
        if not user:
            return None
        if not pwd_context.verify(password, user.hashed_password):
            return None
        return user

    def create_access_token(
        self,
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create JWT access token
        """
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    async def get_current_user(
        self,
        db: Session,
        token: str = Depends(oauth2_scheme)
    ) -> models.User:
        """
        Get current user from JWT token
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception

        user = self.get_user_by_email(db, email=email)
        if user is None:
            raise credentials_exception
        return user

    async def get_current_active_user(
        self,
        current_user: models.User = Depends(get_current_user)
    ) -> models.User:
        """
        Get current active user
        """
        if not current_user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return current_user

    def update_last_login(
        self,
        db: Session,
        user_id: int
    ) -> None:
        """
        Update user's last login timestamp
        """
        db_user = self.get_user(db, user_id)
        if db_user:
            db_user.last_login = datetime.utcnow()
            db.commit()

user_service = UserService() 