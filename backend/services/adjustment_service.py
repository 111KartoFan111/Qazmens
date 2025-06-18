from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from datetime import datetime

class AdjustmentService:
    def create_coefficient(
        self,
        db: Session,
        coefficient: schemas.AdjustmentCoefficientCreate,
        user_id: int
    ) -> models.AdjustmentCoefficient:
        """
        Create a new adjustment coefficient
        """
        db_coefficient = models.AdjustmentCoefficient(
            feature_name=coefficient.feature_name,
            coefficient_value=coefficient.coefficient_value,
            description=coefficient.description,
            is_active=True,
            created_at=datetime.utcnow(),
            created_by=user_id
        )
        db.add(db_coefficient)
        db.commit()
        db.refresh(db_coefficient)
        return db_coefficient

    def get_coefficient(
        self,
        db: Session,
        coefficient_id: int
    ) -> Optional[models.AdjustmentCoefficient]:
        """
        Get adjustment coefficient by ID
        """
        return db.query(models.AdjustmentCoefficient)\
            .filter(models.AdjustmentCoefficient.id == coefficient_id)\
            .first()

    def get_coefficients(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = True
    ) -> List[models.AdjustmentCoefficient]:
        """
        Get list of adjustment coefficients
        """
        query = db.query(models.AdjustmentCoefficient)
        if active_only:
            query = query.filter(models.AdjustmentCoefficient.is_active == True)
        return query.offset(skip).limit(limit).all()

    def get_coefficient_by_feature(
        self,
        db: Session,
        feature_name: str
    ) -> Optional[models.AdjustmentCoefficient]:
        """
        Get adjustment coefficient by feature name
        """
        return db.query(models.AdjustmentCoefficient)\
            .filter(models.AdjustmentCoefficient.feature_name == feature_name)\
            .filter(models.AdjustmentCoefficient.is_active == True)\
            .first()

    def update_coefficient(
        self,
        db: Session,
        coefficient_id: int,
        coefficient_update: schemas.AdjustmentCoefficientUpdate
    ) -> Optional[models.AdjustmentCoefficient]:
        """
        Update adjustment coefficient
        """
        db_coefficient = self.get_coefficient(db, coefficient_id)
        if not db_coefficient:
            return None

        update_data = coefficient_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_coefficient, field, value)

        db_coefficient.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_coefficient)
        return db_coefficient

    def delete_coefficient(
        self,
        db: Session,
        coefficient_id: int
    ) -> bool:
        """
        Delete adjustment coefficient
        """
        db_coefficient = self.get_coefficient(db, coefficient_id)
        if not db_coefficient:
            return False

        db.delete(db_coefficient)
        db.commit()
        return True

    def deactivate_coefficient(
        self,
        db: Session,
        coefficient_id: int
    ) -> Optional[models.AdjustmentCoefficient]:
        """
        Deactivate adjustment coefficient
        """
        db_coefficient = self.get_coefficient(db, coefficient_id)
        if not db_coefficient:
            return None

        db_coefficient.is_active = False
        db_coefficient.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_coefficient)
        return db_coefficient

    def get_coefficient_history(
        self,
        db: Session,
        coefficient_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[models.AdjustmentCoefficient]:
        """
        Get coefficient change history
        """
        return db.query(models.AdjustmentCoefficient)\
            .filter(models.AdjustmentCoefficient.id == coefficient_id)\
            .order_by(models.AdjustmentCoefficient.updated_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()

    def apply_coefficients(
        self,
        db: Session,
        property_features: List[schemas.PropertyFeature]
    ) -> List[schemas.Adjustment]:
        """
        Apply adjustment coefficients to property features
        """
        adjustments = []
        for feature in property_features:
            coefficient = self.get_coefficient_by_feature(db, feature.name)
            if coefficient:
                adjustment = schemas.Adjustment(
                    feature=feature.name,
                    value=coefficient.coefficient_value * feature.value,
                    description=coefficient.description
                )
                adjustments.append(adjustment)
        return adjustments

    def validate_coefficients(
        self,
        db: Session,
        coefficients: List[schemas.AdjustmentCoefficientCreate]
    ) -> List[str]:
        """
        Validate adjustment coefficients
        """
        errors = []
        for coefficient in coefficients:
            # Check if coefficient already exists
            existing = self.get_coefficient_by_feature(db, coefficient.feature_name)
            if existing:
                errors.append(f"Coefficient for feature '{coefficient.feature_name}' already exists")

            # Validate coefficient value
            if coefficient.coefficient_value <= 0:
                errors.append(f"Coefficient value for '{coefficient.feature_name}' must be positive")

            # Validate feature name
            if not coefficient.feature_name.strip():
                errors.append("Feature name cannot be empty")

        return errors

adjustment_service = AdjustmentService() 