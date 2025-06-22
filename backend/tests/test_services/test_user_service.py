import pytest
from services.user_service import UserService
from schemas import UserCreate, UserUpdate
from models import User

class TestUserService:
    
    def setup_method(self):
        self.user_service = UserService()

    def test_create_user(self, db_session):
        """Тестирование создания пользователя"""
        user_data = UserCreate(
            email="newuser@example.com",
            username="newuser",
            full_name="New User",
            password="password123",
            role="appraiser"
        )
        
        created_user = self.user_service.create_user(db_session, user_data)
        
        assert created_user.id is not None
        assert created_user.email == "newuser@example.com"
        assert created_user.username == "newuser"
        assert created_user.is_active is True
        # Пароль должен быть захеширован
        assert created_user.hashed_password != "password123"

    def test_create_duplicate_user(self, db_session):
        """Тестирование создания дублирующего пользователя"""
        user_data = UserCreate(
            email="duplicate@example.com",
            username="duplicate",
            full_name="Duplicate User",
            password="password123",
            role="appraiser"
        )
        
        # Создаем первого пользователя
        self.user_service.create_user(db_session, user_data)
        
        # Пытаемся создать второго с тем же email
        with pytest.raises(Exception):  # HTTPException
            self.user_service.create_user(db_session, user_data)

    def test_authenticate_user(self, db_session):
        """Тестирование аутентификации пользователя"""
        # Создаем пользователя
        user_data = UserCreate(
            email="auth@example.com",
            username="authuser",
            full_name="Auth User",
            password="password123",
            role="appraiser"
        )
        
        created_user = self.user_service.create_user(db_session, user_data)
        
        # Тестируем успешную аутентификацию
        authenticated_user = self.user_service.authenticate_user(
            db_session, "auth@example.com", "password123"
        )
        assert authenticated_user is not None
        assert authenticated_user.id == created_user.id
        
        # Тестируем неуспешную аутентификацию
        failed_auth = self.user_service.authenticate_user(
            db_session, "auth@example.com", "wrongpassword"
        )
        assert failed_auth is None

    def test_create_access_token(self):
        """Тестирование создания токена доступа"""
        from datetime import timedelta
        
        data = {"sub": "test@example.com", "user_id": 1, "role": "appraiser"}
        token = self.user_service.create_access_token(data, timedelta(minutes=30))
        
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Проверяем, что токен можно декодировать
        from jose import jwt
        import os
        
        SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        assert decoded["sub"] == "test@example.com"
        assert decoded["user_id"] == 1