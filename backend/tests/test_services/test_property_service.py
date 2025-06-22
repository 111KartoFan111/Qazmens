import pytest
from services.property_service import PropertyService
from schemas import PropertyCreate, PropertyUpdate
from models import Property

class TestPropertyService:
    
    def test_create_property(self, db_session):
        """Тестирование создания объекта недвижимости"""
        property_data = PropertyCreate(
            address="Test Street, 456",
            property_type="apartment",
            area=75.0,
            floor_level=3,
            total_floors=9,
            condition="excellent",
            renovation_status="recentlyRenovated",
            location={"lat": 43.2220, "lng": 76.8512},
            price=38000000,
            features=[{"name": "parking", "value": 1, "unit": "space"}]
        )
        
        created_property = PropertyService.create_property(db_session, property_data)
        
        assert created_property.id is not None
        assert created_property.address == "Test Street, 456"
        assert created_property.area == 75.0
        assert created_property.price == 38000000

    def test_get_property(self, db_session):
        """Тестирование получения объекта недвижимости"""
        # Создаем объект
        property_data = PropertyCreate(
            address="Get Test Street, 789",
            property_type="house",
            area=120.0,
            floor_level=1,
            total_floors=2,
            condition="good",
            renovation_status="partiallyRenovated",
            location={"lat": 43.2220, "lng": 76.8512},
            price=55000000,
            features=[]
        )
        
        created_property = PropertyService.create_property(db_session, property_data)
        
        # Получаем объект
        retrieved_property = PropertyService.get_property(db_session, created_property.id)
        
        assert retrieved_property is not None
        assert retrieved_property.id == created_property.id
        assert retrieved_property.address == "Get Test Street, 789"

    def test_get_properties_with_filters(self, db_session):
        """Тестирование получения списка объектов с фильтрами"""
        # Создаем несколько объектов
        properties_data = [
            PropertyCreate(
                address="Filter Test 1",
                property_type="apartment",
                area=80.0,
                floor_level=5,
                total_floors=10,
                condition="excellent",
                renovation_status="recentlyRenovated",
                location={"lat": 43.2220, "lng": 76.8512},
                price=40000000,
                features=[]
            ),
            PropertyCreate(
                address="Filter Test 2",
                property_type="house",
                area=150.0,
                floor_level=1,
                total_floors=2,
                condition="good",
                renovation_status="original",
                location={"lat": 43.2220, "lng": 76.8512},
                price=60000000,
                features=[]
            )
        ]
        
        for prop_data in properties_data:
            PropertyService.create_property(db_session, prop_data)
        
        # Тестируем фильтр по типу
        apartments = PropertyService.get_properties(
            db_session, property_type="apartment"
        )
        assert len(apartments) == 1
        assert apartments[0].property_type == "apartment"
        
        # Тестируем фильтр по цене
        expensive_properties = PropertyService.get_properties(
            db_session, min_price=50000000
        )
        assert len(expensive_properties) == 1
        assert expensive_properties[0].price >= 50000000

    def test_update_property(self, db_session):
        """Тестирование обновления объекта недвижимости"""
        # Создаем объект
        property_data = PropertyCreate(
            address="Update Test Street",
            property_type="apartment",
            area=90.0,
            floor_level=7,
            total_floors=15,
            condition="fair",
            renovation_status="needsRenovation",
            location={"lat": 43.2220, "lng": 76.8512},
            price=35000000,
            features=[]
        )
        
        created_property = PropertyService.create_property(db_session, property_data)
        
        # Обновляем объект
        update_data = PropertyUpdate(
            condition="good",
            renovation_status="partiallyRenovated",
            price=42000000
        )
        
        updated_property = PropertyService.update_property(
            db_session, created_property.id, update_data
        )
        
        assert updated_property.condition == "good"
        assert updated_property.renovation_status == "partiallyRenovated"
        assert updated_property.price == 42000000
        assert updated_property.address == "Update Test Street"  # Не изменилось

    def test_delete_property(self, db_session):
        """Тестирование удаления объекта недвижимости"""
        # Создаем объект
        property_data = PropertyCreate(
            address="Delete Test Street",
            property_type="commercial",
            area=200.0,
            floor_level=1,
            total_floors=1,
            condition="excellent",
            renovation_status="recentlyRenovated",
            location={"lat": 43.2220, "lng": 76.8512},
            price=100000000,
            features=[]
        )
        
        created_property = PropertyService.create_property(db_session, property_data)
        property_id = created_property.id
        
        # Удаляем объект
        result = PropertyService.delete_property(db_session, property_id)
        assert result is True
        
        # Проверяем, что объект удален
        deleted_property = PropertyService.get_property(db_session, property_id)
        assert deleted_property is Noneы