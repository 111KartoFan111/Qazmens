# backend/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import models
import schemas
from database import get_db
from services.user_service import user_service

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user
    """
    try:
        db_user = user_service.create_user(db=db, user=user)
        return db_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=dict)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login user and return access token
    """
    user = user_service.authenticate_user(
        db=db,
        email=form_data.username,  # OAuth2PasswordRequestForm uses 'username' field
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login
    user_service.update_last_login(db=db, user_id=user.id)
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = user_service.create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/me", response_model=schemas.User)
def get_current_user_info(
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Get current user information
    """
    return current_user

@router.post("/logout")
def logout():
    """
    Logout user (client-side token removal)
    """
    return {"message": "Successfully logged out"}

@router.post("/refresh")
def refresh_token(
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Refresh access token
    """
    access_token_expires = timedelta(minutes=30)
    access_token = user_service.create_access_token(
        data={"sub": current_user.email, "user_id": current_user.id, "role": current_user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }