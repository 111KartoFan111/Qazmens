# backend/services/property_service.py
from typing import List, Optional
from sqlalchemy.orm import Session
from models import Property
from schemas import PropertyCreate, PropertyUpdate
from fastapi import HTTPException, status

class PropertyService:
    @staticmethod
    def create_property(db: Session, property_data: PropertyCreate) -> Property:
        # Convert Pydantic model to dict and handle nested objects
        property_dict = property_data.model_dump()
        
        # Handle location separately as JSON
        location_data = property_dict.pop('location', None)
        features_data = property_dict.pop('features', [])
        
        db_property = Property(
            **property_dict,
            location=location_data,
            features=features_data
        )
        
        db.add(db_property)
        db.commit()
        db.refresh(db_property)
        return db_property

    @staticmethod
    def get_property(db: Session, property_id: int) -> Optional[Property]:
        return db.query(Property).filter(Property.id == property_id).first()

    @staticmethod
    def get_properties(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        property_type: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> List[Property]:
        query = db.query(Property)
        
        if property_type:
            query = query.filter(Property.property_type == property_type)
        if min_price:
            query = query.filter(Property.price >= min_price)
        if max_price:
            query = query.filter(Property.price <= max_price)
            
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def update_property(
        db: Session,
        property_id: int,
        property_data: PropertyUpdate
    ) -> Optional[Property]:
        db_property = PropertyService.get_property(db, property_id)
        if not db_property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found"
            )
        
        # Convert to dict and exclude unset values
        update_data = property_data.model_dump(exclude_unset=True)
        
        # Handle nested objects
        if 'location' in update_data:
            db_property.location = update_data['location']
        if 'features' in update_data:
            db_property.features = update_data['features']
            
        # Update other fields
        for key, value in update_data.items():
            if key not in ['location', 'features'] and hasattr(db_property, key):
                setattr(db_property, key, value)
            
        db.commit()
        db.refresh(db_property)
        return db_property

    @staticmethod
    def delete_property(db: Session, property_id: int) -> bool:
        db_property = PropertyService.get_property(db, property_id)
        if not db_property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found"
            )
            
        db.delete(db_property)
        db.commit()
        return True

    @staticmethod
    def search_properties(
        db: Session,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Property]:
        return db.query(Property).filter(
            Property.address.ilike(f"%{query}%")
        ).offset(skip).limit(limit).all()

    @staticmethod
    def get_properties_by_location(
        db: Session,
        latitude: float,
        longitude: float,
        radius_km: float = 5.0,
        skip: int = 0,
        limit: int = 100
    ) -> List[Property]:
        # TODO: Implement geospatial search with PostGIS or similar
        # For now, return all properties
        return db.query(Property).offset(skip).limit(limit).all()

# Create instance
property_service = PropertyService()