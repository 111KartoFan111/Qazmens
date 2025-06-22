import pytest

class TestAuthAPI:
    
    def test_register_success(self, client):
        """Тестирование успешной регистрации"""
        user_data = {
            "email": "register@example.com",
            "username": "registeruser",
            "full_name": "Register User",
            "password": "password123",
            "role": "appraiser"
        }
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "register@example.com"
        assert data["username"] == "registeruser"
        assert "id" in data

    def test_register_duplicate_email(self, client):
        """Тестирование регистрации с дублирующим email"""
        user_data = {
            "email": "duplicate@example.com",
            "username": "user1",
            "full_name": "User One",
            "password": "password123",
            "role": "appraiser"
        }
        
        # Первая регистрация
        response1 = client.post("/auth/register", json=user_data)
        assert response1.status_code == 200
        
        # Попытка повторной регистрации
        user_data["username"] = "user2"  # Меняем username, но email остается тот же
        response2 = client.post("/auth/register", json=user_data)
        assert response2.status_code == 400

    def test_login_success(self, client, db_session):
        """Тестирование успешного входа"""
        # Сначала регистрируем пользователя
        user_data = {
            "email": "login@example.com",
            "username": "loginuser",
            "full_name": "Login User",
            "password": "password123",
            "role": "appraiser"
        }
        client.post("/auth/register", json=user_data)
        
        # Теперь входим
        login_data = {
            "username": "login@example.com",
            "password": "password123"
        }
        
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data

    def test_login_invalid_credentials(self, client):
        """Тестирование входа с неверными данными"""
        login_data = {
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        response = client.post("/auth/login", data=login_data)
        assert response.status_code == 401

    def test_get_current_user(self, authenticated_client):
        """Тестирование получения информации о текущем пользователе"""
        client, user = authenticated_client
        
        response = client.get("/auth/me")
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == user.email
        assert data["username"] == user.username