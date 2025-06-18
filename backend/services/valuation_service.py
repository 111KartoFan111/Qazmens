from sqlalchemy.orm import Session
from typing import List, Dict, Any
import models
import schemas
from datetime import datetime
from typing import Optional
import math

class ValuationService:
    def calculate_valuation(
        self,
        db: Session,
        subject_property: schemas.Property,
        comparable_properties: List[schemas.Property]
    ) -> schemas.ValuationResult:
        """
        Calculate property valuation using the comparative approach
        """
        adjustments = {}
        adjusted_prices = []

        for comp_property in comparable_properties:
            property_adjustments = self._calculate_adjustments(
                subject_property,
                comp_property
            )
            adjustments[comp_property.id] = property_adjustments

            # Calculate adjusted price
            adjusted_price = self._calculate_adjusted_price(
                comp_property.price,
                property_adjustments
            )
            adjusted_prices.append(adjusted_price)

        # Calculate final valuation
        final_valuation = self._calculate_final_valuation(adjusted_prices)
        confidence_score = self._calculate_confidence_score(
            adjusted_prices,
            final_valuation
        )

        # Create valuation result
        result = schemas.ValuationResult(
            subject_property=subject_property,
            comparable_properties=comparable_properties,
            adjustments=adjustments,
            final_valuation=final_valuation,
            confidence_score=confidence_score,
            created_at=datetime.utcnow()
        )

        # Save to history
        self._save_to_history(db, result)

        return result

    def _calculate_adjustments(
        self,
        subject: schemas.Property,
        comparable: schemas.Property
    ) -> List[schemas.Adjustment]:
        """
        Calculate adjustments for each feature
        """
        adjustments = []

        # Area adjustment
        area_adjustment = self._calculate_area_adjustment(
            subject.area,
            comparable.area
        )
        adjustments.append(schemas.Adjustment(
            feature="area",
            value=area_adjustment,
            description="Adjustment for area difference"
        ))

        # Floor level adjustment
        floor_adjustment = self._calculate_floor_adjustment(
            subject.floor_level,
            comparable.floor_level,
            subject.total_floors,
            comparable.total_floors
        )
        adjustments.append(schemas.Adjustment(
            feature="floor_level",
            value=floor_adjustment,
            description="Adjustment for floor level difference"
        ))

        # Condition adjustment
        condition_adjustment = self._calculate_condition_adjustment(
            subject.condition,
            comparable.condition
        )
        adjustments.append(schemas.Adjustment(
            feature="condition",
            value=condition_adjustment,
            description="Adjustment for condition difference"
        ))

        # Distance adjustment
        distance_adjustment = self._calculate_distance_adjustment(
            subject.location,
            comparable.location
        )
        adjustments.append(schemas.Adjustment(
            feature="distance",
            value=distance_adjustment,
            description="Adjustment for distance difference"
        ))

        # Renovation adjustment
        renovation_adjustment = self._calculate_renovation_adjustment(
            subject.renovation_status,
            comparable.renovation_status
        )
        adjustments.append(schemas.Adjustment(
            feature="renovation",
            value=renovation_adjustment,
            description="Adjustment for renovation status difference"
        ))

        # Additional features adjustments
        for feature in subject.features:
            comp_feature = next(
                (f for f in comparable.features if f.name == feature.name),
                None
            )
            if comp_feature:
                feature_adjustment = self._calculate_feature_adjustment(
                    feature,
                    comp_feature
                )
                adjustments.append(schemas.Adjustment(
                    feature=feature.name,
                    value=feature_adjustment,
                    description=f"Adjustment for {feature.name} difference"
                ))

        return adjustments

    def _calculate_area_adjustment(
        self,
        subject_area: float,
        comparable_area: float
    ) -> float:
        """
        Calculate adjustment for area difference
        """
        area_difference = subject_area - comparable_area
        adjustment_rate = 0.01  # 1% per square meter
        return area_difference * adjustment_rate

    def _calculate_floor_adjustment(
        self,
        subject_floor: int,
        comparable_floor: int,
        subject_total_floors: int,
        comparable_total_floors: int
    ) -> float:
        """
        Calculate adjustment for floor level difference
        """
        # Normalize floor levels to 0-1 range
        subject_normalized = subject_floor / subject_total_floors
        comparable_normalized = comparable_floor / comparable_total_floors
        
        # Calculate adjustment (2% per floor level difference)
        floor_difference = subject_normalized - comparable_normalized
        return floor_difference * 2

    def _calculate_condition_adjustment(
        self,
        subject_condition: str,
        comparable_condition: str
    ) -> float:
        """
        Calculate adjustment for condition difference
        """
        condition_values = {
            "excellent": 1.0,
            "good": 0.9,
            "fair": 0.8,
            "poor": 0.7
        }
        return (condition_values[subject_condition] - condition_values[comparable_condition]) * 100

    def _calculate_distance_adjustment(
        self,
        subject_location: schemas.Location,
        comparable_location: schemas.Location
    ) -> float:
        """
        Calculate adjustment for distance difference using Haversine formula
        """
        R = 6371  # Earth's radius in km
        dLat = math.radians(comparable_location.lat - subject_location.lat)
        dLon = math.radians(comparable_location.lng - subject_location.lng)
        lat1 = math.radians(subject_location.lat)
        lat2 = math.radians(comparable_location.lat)

        a = math.sin(dLat/2) * math.sin(dLat/2) + \
            math.sin(dLon/2) * math.sin(dLon/2) * math.cos(lat1) * math.cos(lat2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c

        # Adjust price based on distance (0.5% per km)
        return distance * 0.005

    def _calculate_renovation_adjustment(
        self,
        subject_renovation: str,
        comparable_renovation: str
    ) -> float:
        """
        Calculate adjustment for renovation status difference
        """
        renovation_values = {
            "new": 1.0,
            "renovated": 0.95,
            "partial": 0.9,
            "none": 0.85
        }
        return (renovation_values[subject_renovation] - renovation_values[comparable_renovation]) * 100

    def _calculate_feature_adjustment(
        self,
        subject_feature: schemas.PropertyFeature,
        comparable_feature: schemas.PropertyFeature
    ) -> float:
        """
        Calculate adjustment for additional feature difference
        """
        feature_difference = subject_feature.value - comparable_feature.value
        adjustment_rate = 0.02  # 2% per unit difference
        return feature_difference * adjustment_rate

    def _calculate_adjusted_price(
        self,
        original_price: float,
        adjustments: List[schemas.Adjustment]
    ) -> float:
        """
        Calculate adjusted price based on all adjustments
        """
        total_adjustment = sum(adj.value for adj in adjustments)
        return original_price * (1 + total_adjustment)

    def _calculate_final_valuation(
        self,
        adjusted_prices: List[float]
    ) -> float:
        """
        Calculate final valuation as weighted average of adjusted prices
        """
        if not adjusted_prices:
            return 0.0
        
        # Use simple average for now, can be enhanced with weights
        return sum(adjusted_prices) / len(adjusted_prices)

    def _calculate_confidence_score(
        self,
        adjusted_prices: List[float],
        final_valuation: float
    ) -> float:
        """
        Calculate confidence score based on price dispersion
        """
        if not adjusted_prices:
            return 0.0

        # Calculate standard deviation
        mean = sum(adjusted_prices) / len(adjusted_prices)
        squared_diff_sum = sum((price - mean) ** 2 for price in adjusted_prices)
        std_dev = math.sqrt(squared_diff_sum / len(adjusted_prices))

        # Calculate coefficient of variation
        cv = std_dev / mean if mean != 0 else float('inf')

        # Convert to confidence score (0-1)
        confidence = 1 / (1 + cv)
        return min(max(confidence, 0), 1)

    def _save_to_history(
        self,
        db: Session,
        result: schemas.ValuationResult
    ) -> None:
        """
        Save valuation result to history
        """
        history_item = models.ValuationHistory(
            property_id=result.subject_property.id,
            valuation_date=result.created_at,
            valuation_type="subject",
            original_price=result.subject_property.price,
            adjusted_price=result.final_valuation,
            adjustments=result.adjustments,
            comparable_properties=[p.id for p in result.comparable_properties],
            created_by="system",  # TODO: Add user authentication
            notes=f"Confidence score: {result.confidence_score:.2f}"
        )
        db.add(history_item)
        db.commit()

    def get_valuation_history(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[models.ValuationHistory]:
        """
        Get valuation history
        """
        return db.query(models.ValuationHistory)\
            .order_by(models.ValuationHistory.valuation_date.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()

    def get_valuation_history_item(
        self,
        db: Session,
        history_id: int
    ) -> Optional[models.ValuationHistory]:
        """
        Get specific valuation history item
        """
        return db.query(models.ValuationHistory)\
            .filter(models.ValuationHistory.id == history_id)\
            .first()

valuation_service = ValuationService() 