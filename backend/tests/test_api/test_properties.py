import pytest
from fastapi.testclient import TestClient

class TestPropertiesAPI:
    
    def test_create_property_success(self, authenticated_client):
        """Тестирование успешного создания объекта недвижимости"""
        client, user = authenticated_client
        
        property_data = {
            "address": "API Test Street, 123",
            "property_type": "apartment",
            "area": 75.5,
            "floor_level": 4,
            "total_floors": 10,
            "condition": "good",
            "renovation_status": "recentlyRenovated",
            "location": {"lat": 43.2220, "lng": 76.8512},
            "price": 40000000,
            "features": [
                {"name": "balcony", "value": 1, "unit": "count", "description": "Small balcony"}
            ]
        }
        
        response = client.post("/api/properties/", json=property_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["address"] == "API Test Street, 123"
        assert data["area"] == 75.5
        assert data["price"] == 40000000
        assert "id" in data

    def test_create_property_unauthorized(self, client):
        """Тестирование создания объекта без авторизации"""
        property_data = {
            "address": "Unauthorized Test",
            "property_type": "apartment",
            "area": 50.0,
            "floor_level": 1,
            "total_floors": 5,
            "condition": "good",
            "renovation_status": "original",
            "location": {"lat": 43.2220, "lng": 76.8512},
            "price": 30000000,
            "features": []
        }
        
        response = client.post("/api/properties/", json=property_data)
        assert response.status_code == 401

    def test_get_properties(self, authenticated_client):
        """Тестирование получения списка объектов недвижимости"""
        client, user = authenticated_client
        
        # Создаем несколько объектов
        for i in range(3):
            property_data = {
                "address": f"Get Test Street {i}",
                "property_type": "apartment",
                "area": 60.0 + i * 10,
                "floor_level": i + 1,
                "total_floors": 8,
                "condition": "good",
                "renovation_status": "original",
                "location": {"lat": 43.2220, "lng": 76.8512},
                "price": 35000000 + i * 5000000,
                "features": []
            }
            client.post("/api/properties/", json=property_data)
        
        response = client.get("/api/properties/")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3

    def test_get_property_by_id(self, authenticated_client):
        """Тестирование получения объекта по ID"""
        client, user = authenticated_client
        
        # Создаем объект
        property_data = {
            "address": "Get By ID Test",
            "property_type": "house",
            "area": 120.0,
            "floor_level": 1,
            "total_floors": 2,
            "condition": "excellent",
            "renovation_status": "recentlyRenovated",
            "location": {"lat": 43.2220, "lng": 76.8512},
            "price": 80000000,
            "features": []
        }
        
        create_response = client.post("/api/properties/", json=property_data)
        created_property = create_response.json()
        property_id = created_property["id"]
        
        # Получаем объект по ID
        response = client.get(f"/api/properties/{property_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == property_id
        assert data["address"] == "Get By ID Test"

    def test_update_property(self, authenticated_client):
        """Тестирование обновления объекта недвижимости"""
        client, user = authenticated_client
        
        # Создаем объект
        property_data = {
            "address": "Update Test Property",
            "property_type": "apartment",
            "area": 85.0,
            "floor_level": 6,
            "total_floors": 12,
            "condition": "fair",
            "renovation_status": "needsRenovation",
            "location": {"lat": 43.2220, "lng": 76.8512},
            "price": 38000000,
            "features": []
        }
        
        create_response = client.post("/api/properties/", json=property_data)
        created_property = create_response.json()
        property_id = created_property["id"]
        
        # Обновляем объект
        update_data = {
            "condition": "good",
            "renovation_status": "partiallyRenovated",
            "price": 44000000
        }
        
        response = client.put(f"/api/properties/{property_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["condition"] == "good"
        assert data["renovation_status"] == "partiallyRenovated"
        assert data["price"] == 44000000

    def test_delete_property(self, authenticated_client):
        """Тестирование удаления объекта недвижимости"""
        client, user = authenticated_client
        
        # Создаем объект
        property_data = {
            "address": "Delete Test Property",
            "property_type": "commercial",
            "area": 150.0,
            "floor_level": 1,
            "total_floors": 1,
            "condition": "good",
            "renovation_status": "original",
            "location": {"lat": 43.2220, "lng": 76.8512},
            "price": 100000000,
            "features": []
        }
        
        create_response = client.post("/api/properties/", json=property_data)
        created_property = create_response.json()
        property_id = created_property["id"]
        
        # Удаляем объект
        response = client.delete(f"/api/properties/{property_id}")
        
        assert response.status_code == 200
        
        # Проверяем, что объект удален
        get_response = client.get(f"/api/properties/{property_id}")
        assert get_response.status_code == 404
