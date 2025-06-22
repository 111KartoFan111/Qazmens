import pytest
from services.valuation_service import ValuationService
from schemas import Property, Location, PropertyFeature
import math

class TestValuationService:
    
    def setup_method(self):
        """Настройка для каждого теста"""
        self.valuation_service = ValuationService()
        
        # Тестовые объекты
        self.subject_property = Property(
            id=1,
            address="Subject Property Address",
            property_type="apartment",
            area=85.0,
            floor_level=5,
            total_floors=12,
            condition="good",
            renovation_status="recentlyRenovated",
            location=Location(lat=43.2220, lng=76.8512),
            price=45000000,
            features=[],
            created_at="2024-01-01T00:00:00",
            updated_at="2024-01-01T00:00:00"
        )
        
        self.comparable_properties = [
            Property(
                id=2,
                address="Comparable 1",
                property_type="apartment",
                area=80.0,
                floor_level=3,
                total_floors=12,
                condition="excellent",
                renovation_status="recentlyRenovated",
                location=Location(lat=43.2230, lng=76.8522),
                price=42000000,
                features=[],
                created_at="2024-01-01T00:00:00",
                updated_at="2024-01-01T00:00:00"
            ),
            Property(
                id=3,
                address="Comparable 2",
                property_type="apartment",
                area=90.0,
                floor_level=7,
                total_floors=12,
                condition="good",
                renovation_status="partiallyRenovated",
                location=Location(lat=43.2210, lng=76.8502),
                price=48000000,
                features=[],
                created_at="2024-01-01T00:00:00",
                updated_at="2024-01-01T00:00:00"
            )
        ]

    def test_calculate_area_adjustment(self):
        """Тестирование расчета корректировки по площади"""
        adjustment = self.valuation_service._calculate_area_adjustment(85.0, 80.0)
        expected = 5.0 * 100  # 5 м² * 100 ₸/м²
        assert adjustment == expected

    def test_calculate_floor_adjustment(self):
        """Тестирование расчета корректировки по этажу"""
        adjustment = self.valuation_service._calculate_floor_adjustment(5, 3, 12, 12)
        # Нормализованная разница: (5/12) - (3/12) = 2/12
        expected = (2/12) * 2000
        assert abs(adjustment - expected) < 0.01

    def test_calculate_condition_adjustment(self):
        """Тестирование расчета корректировки по состоянию"""
        adjustment = self.valuation_service._calculate_condition_adjustment("good", "excellent")
        # good = 0.9, excellent = 1.0
        expected = (0.9 - 1.0) * 5000
        assert adjustment == expected

    def test_calculate_distance_adjustment(self):
        """Тестирование расчета корректировки по расстоянию"""
        location1 = Location(lat=43.2220, lng=76.8512)
        location2 = Location(lat=43.2230, lng=76.8522)
        
        adjustment = self.valuation_service._calculate_distance_adjustment(location1, location2)
        
        # Проверяем, что корректировка отрицательная (дальше = хуже)
        assert adjustment < 0

    def test_calculate_renovation_adjustment(self):
        """Тестирование расчета корректировки по ремонту"""
        adjustment = self.valuation_service._calculate_renovation_adjustment(
            "recentlyRenovated", "partiallyRenovated"
        )
        # recentlyRenovated = 1.0, partiallyRenovated = 0.8
        expected = (1.0 - 0.8) * 8000
        assert adjustment == expected

    def test_calculate_adjusted_price(self):
        """Тестирование расчета скорректированной цены"""
        from schemas import Adjustment
        
        adjustments = [
            Adjustment(feature="area", value=500, description="Area adjustment"),
            Adjustment(feature="floor", value=-300, description="Floor adjustment"),
            Adjustment(feature="condition", value=1000, description="Condition adjustment")
        ]
        
        adjusted_price = self.valuation_service._calculate_adjusted_price(45000000, adjustments)
        expected = 45000000 + 500 - 300 + 1000
        assert adjusted_price == expected

    def test_calculate_final_valuation(self):
        """Тестирование расчета итоговой оценки"""
        adjusted_prices = [44000000, 46000000, 45000000]
        final_valuation = self.valuation_service._calculate_final_valuation(adjusted_prices)
        expected = sum(adjusted_prices) / len(adjusted_prices)
        assert final_valuation == expected

    def test_calculate_confidence_score(self):
        """Тестирование расчета индекса уверенности"""
        # Цены с низким разбросом (высокая уверенность)
        adjusted_prices = [45000000, 45100000, 44900000]
        final_valuation = 45000000
        
        confidence = self.valuation_service._calculate_confidence_score(adjusted_prices, final_valuation)
        assert 0.9 <= confidence <= 1.0
        
        # Цены с высоким разбросом (низкая уверенность)
        adjusted_prices = [40000000, 50000000, 45000000]
        final_valuation = 45000000
        
        confidence = self.valuation_service._calculate_confidence_score(adjusted_prices, final_valuation)
        assert 0.0 <= confidence <= 0.8

    def test_calculate_valuation_integration(self, db_session):
        """Интеграционный тест полного расчета оценки"""
        result = self.valuation_service.calculate_valuation(
            db_session, 
            self.subject_property, 
            self.comparable_properties
        )
        
        assert result.final_valuation > 0
        assert 0 <= result.confidence_score <= 1
        assert len(result.comparable_properties) == 2
        assert len(result.adjustments) == 2  # По количеству сравнимых объектов
        
        # Проверяем структуру корректировок
        for comp_id, adjustments in result.adjustments.items():
            assert isinstance(adjustments, list)
            assert len(adjustments) > 0
            for adjustment in adjustments:
                assert hasattr(adjustment, 'feature')
                assert hasattr(adjustment, 'value')