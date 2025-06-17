from typing import List, Dict
import numpy as np
from .models import SubjectProperty, ComparableProperty, PropertyFeature, PropertyCondition, RenovationStatus

class ValuationService:
    def __init__(self):
        self.weight_factors = {
            "area": 0.3,
            "floor": 0.2,
            "condition": 0.25,
            "distance": 0.15,
            "renovation": 0.1
        }

    def calculate_distance_adjustment(self, subject_distance: float, comp_distance: float) -> float:
        """Calculate price adjustment based on distance from city center."""
        distance_diff = comp_distance - subject_distance
        return distance_diff * 1000  # $1000 per km adjustment

    def calculate_renovation_adjustment(self, subject_status: RenovationStatus, comp_status: RenovationStatus) -> float:
        """Calculate price adjustment based on renovation status."""
        renovation_values = {
            RenovationStatus.RECENTLY_RENOVATED: 1.0,
            RenovationStatus.PARTIALLY_RENOVATED: 0.9,
            RenovationStatus.NEEDS_RENOVATION: 0.7,
            RenovationStatus.ORIGINAL: 0.8
        }
        return (renovation_values[comp_status] / renovation_values[subject_status] - 1) * 10000

    def calculate_weighted_price(self, comparable: ComparableProperty, subject: SubjectProperty) -> float:
        """Calculate weighted price based on all adjustment factors."""
        adjustments = {
            "area": comparable.calculate_area_adjustment(subject.area),
            "floor": comparable.calculate_floor_adjustment(subject.floor_level),
            "condition": comparable.calculate_condition_adjustment(subject.condition),
            "distance": self.calculate_distance_adjustment(
                subject.distance_from_center,
                comparable.distance_from_center
            ),
            "renovation": self.calculate_renovation_adjustment(
                subject.renovation_status,
                comparable.renovation_status
            )
        }

        weighted_adjustments = sum(
            adjustment * self.weight_factors[factor]
            for factor, adjustment in adjustments.items()
        )

        return comparable.price + weighted_adjustments

    def calculate_final_valuation(
        self,
        subject: SubjectProperty,
        comparables: List[ComparableProperty]
    ) -> Dict:
        """Calculate final property valuation based on comparable properties."""
        if not comparables:
            raise ValueError("No comparable properties provided")

        # Calculate weighted prices for all comparables
        weighted_prices = [
            self.calculate_weighted_price(comp, subject)
            for comp in comparables
        ]

        # Calculate statistics
        mean_price = np.mean(weighted_prices)
        median_price = np.median(weighted_prices)
        std_dev = np.std(weighted_prices)

        # Remove outliers (prices outside 2 standard deviations)
        filtered_prices = [
            price for price in weighted_prices
            if abs(price - mean_price) <= 2 * std_dev
        ]

        final_price = np.mean(filtered_prices) if filtered_prices else mean_price

        return {
            "final_valuation": round(final_price, 2),
            "mean_price": round(mean_price, 2),
            "median_price": round(median_price, 2),
            "standard_deviation": round(std_dev, 2),
            "comparable_adjustments": [
                {
                    "address": comp.address,
                    "original_price": comp.price,
                    "adjusted_price": round(weighted_price, 2),
                    "adjustments": comp.adjustments
                }
                for comp, weighted_price in zip(comparables, weighted_prices)
            ]
        } 