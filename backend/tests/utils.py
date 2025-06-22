from typing import Dict, Any, List
from models import Property, User, ValuationHistory
from schemas import PropertyCreate, UserCreate
from sqlalchemy.orm import Session
import random

def create_test_property(
    db: Session,
    address: str = "Test Address",
    property_type: str = "apartment",
    area: float = 85.0,
    price: float = 45000000,
    **kwargs
) -> Property:
    """Создает тестовый объект недвижимости"""
    property_data = PropertyCreate(
        address=address,
        property_type=property_type,
        area=area,
        floor_level=kwargs.get('floor_level', 5),
        total_floors=kwargs.get('total_floors', 12),
        condition=kwargs.get('condition', 'good'),
        renovation_status=kwargs.get('renovation_status', 'recentlyRenovated'),
        location=kwargs.get('location', {"lat": 43.2220, "lng": 76.8512}),
        price=price,
        features=kwargs.get('features', [])
    )
    
    from services.property_service import PropertyService
    return PropertyService.create_property(db, property_data)

def create_test_user(
    db: Session,
    email: str = "test@example.com",
    username: str = "testuser",
    role: str = "appraiser",
    **kwargs
) -> User:
    """Создает тестового пользователя"""
    user_data = UserCreate(
        email=email,
        username=username,
        full_name=kwargs.get('full_name', 'Test User'),
        password=kwargs.get('password', 'testpass123'),
        role=role
    )
    
    from services.user_service import user_service
    return user_service.create_user(db, user_data)

def create_test_properties_batch(
    db: Session,
    count: int = 5,
    base_price: float = 40000000
) -> List[Property]:
    """Создает группу тестовых объектов недвижимости"""
    properties = []
    
    for i in range(count):
        property_obj = create_test_property(
            db,
            address=f"Test Address {i+1}",
            area=70.0 + i * 10,
            price=base_price + i * 5000000,
            floor_level=i + 1
        )
        properties.append(property_obj)
    
    return properties

def generate_test_coordinates(
    base_lat: float = 43.2220,
    base_lng: float = 76.8512,
    radius: float = 0.1
) -> Dict[str, float]:
    """Генерирует случайные координаты в радиусе от базовой точки"""
    lat_offset = (random.random() - 0.5) * radius
    lng_offset = (random.random() - 0.5) * radius
    
    return {
        "lat": base_lat + lat_offset,
        "lng": base_lng + lng_offset
    }