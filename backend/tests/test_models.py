import pytest
from datetime import datetime
from models import Property, User, ValuationHistory
from schemas import PropertyCreate, UserCreate

def test_property_model(db_session):
    """Тестирование модели Property"""
    property_data = {
        "address": "Test Address, 123",
        "property_type": "apartment",
        "area": 85.5,
        "floor_level": 5,
        "total_floors": 12,
        "condition": "good",
        "renovation_status": "recentlyRenovated",
        "location": {"lat": 43.2220, "lng": 76.8512},
        "price": 45000000,
        "features": [{"name": "balcony", "value": 1, "unit": "count"}]
    }
    
    property_obj = Property(**property_data)
    db_session.add(property_obj)
    db_session.commit()
    db_session.refresh(property_obj)
    
    assert property_obj.id is not None
    assert property_obj.address == "Test Address, 123"
    assert property_obj.area == 85.5
    assert property_obj.created_at is not None

def test_user_model(db_session):
    """Тестирование модели User"""
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "hashed_password": "hashed_password_here",
        "full_name": "Test User",
        "role": "appraiser",
        "is_active": True
    }
    
    user = User(**user_data)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.is_active is True
