from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum

class PropertyCondition(Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

class RenovationStatus(Enum):
    RECENTLY_RENOVATED = "recently_renovated"
    PARTIALLY_RENOVATED = "partially_renovated"
    NEEDS_RENOVATION = "needs_renovation"
    ORIGINAL = "original"

@dataclass
class PropertyFeature:
    name: str
    value: float
    unit: Optional[str] = None

class BaseProperty:
    def __init__(
        self,
        address: str,
        area: float,
        floor_level: int,
        condition: PropertyCondition,
        distance_from_center: float,
        renovation_status: RenovationStatus,
        features: List[PropertyFeature],
        price: float
    ):
        self.address = address
        self.area = area
        self.floor_level = floor_level
        self.condition = condition
        self.distance_from_center = distance_from_center
        self.renovation_status = renovation_status
        self.features = features
        self.price = price

    def calculate_area_adjustment(self, reference_area: float) -> float:
        """Calculate price adjustment based on area difference."""
        area_diff = self.area - reference_area
        return area_diff * (self.price / self.area)

    def calculate_floor_adjustment(self, reference_floor: int) -> float:
        """Calculate price adjustment based on floor level difference."""
        floor_diff = self.floor_level - reference_floor
        return floor_diff * (self.price * 0.02)  # 2% adjustment per floor

    def calculate_condition_adjustment(self, reference_condition: PropertyCondition) -> float:
        """Calculate price adjustment based on property condition."""
        condition_values = {
            PropertyCondition.EXCELLENT: 1.0,
            PropertyCondition.GOOD: 0.9,
            PropertyCondition.FAIR: 0.8,
            PropertyCondition.POOR: 0.7
        }
        adjustment = (condition_values[self.condition] / condition_values[reference_condition] - 1)
        return self.price * adjustment

class SubjectProperty(BaseProperty):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.adjusted_price = self.price

    def get_adjusted_price(self) -> float:
        return self.adjusted_price

class ComparableProperty(BaseProperty):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.adjustments: Dict[str, float] = {}

    def calculate_total_adjustment(self, subject: SubjectProperty) -> float:
        """Calculate total adjustment compared to subject property."""
        self.adjustments = {
            "area": self.calculate_area_adjustment(subject.area),
            "floor": self.calculate_floor_adjustment(subject.floor_level),
            "condition": self.calculate_condition_adjustment(subject.condition)
        }
        return sum(self.adjustments.values())

    def get_adjusted_price(self) -> float:
        """Get the final adjusted price after all adjustments."""
        return self.price + sum(self.adjustments.values()) 