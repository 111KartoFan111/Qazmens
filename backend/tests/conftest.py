import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import sys
import os

# Добавляем backend в путь
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from main import app
from database import get_db, Base
from models import User, Property, ValuationHistory

# ВАЖНО: SQLite используется ТОЛЬКО для тестов!
# Основная база данных остается PostgreSQL
# SQLite :memory: создает временную БД в оперативной памяти
# Преимущества для тестов:
# 1. Быстрая работа (в памяти)
# 2. Изолированность (каждый тест получает чистую БД)
# 3. Автоматическая очистка после завершения теста
# 4. Не требует настройки PostgreSQL для тестов
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def authenticated_client(client, db_session):
    """Клиент с аутентифицированным пользователем"""
    # Создаем тестового пользователя
    from services.user_service import user_service
    from schemas import UserCreate
    
    user_data = UserCreate(
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        password="testpass123",
        role="appraiser"
    )
    
    user = user_service.create_user(db_session, user_data)
    
    # Логинимся
    response = client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "testpass123"
    })
    
    token = response.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    
    return client, user
