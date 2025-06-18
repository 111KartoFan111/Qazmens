from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, index=True)
    property_type = Column(String, index=True)
    area = Column(Float)
    floor_level = Column(Integer)
    total_floors = Column(Integer)
    condition = Column(String)
    renovation_status = Column(String)
    location = Column(JSON)  # {lat: float, lng: float}
    price = Column(Float)
    features = Column(JSON)  # List of property features
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    valuation_history = relationship("ValuationHistory", back_populates="property")

class ValuationHistory(Base):
    __tablename__ = "valuation_history"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    valuation_date = Column(DateTime, default=datetime.utcnow)
    valuation_type = Column(String)  # "subject" or "comparable"
    original_price = Column(Float)
    adjusted_price = Column(Float)
    adjustments = Column(JSON)  # Dictionary of adjustments
    comparable_properties = Column(JSON)  # List of comparable property IDs
    created_by = Column(String)  # User ID or name
    notes = Column(String, nullable=True)

    # Relationships
    property = relationship("Property", back_populates="valuation_history")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)  # "admin" or "appraiser"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class AdjustmentCoefficient(Base):
    __tablename__ = "adjustment_coefficients"

    id = Column(Integer, primary_key=True, index=True)
    feature_name = Column(String, index=True)
    coefficient_value = Column(Float)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)  # User ID or name

class PropertyFeature(Base):
    __tablename__ = "property_features"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    name = Column(String, index=True)
    value = Column(Float)
    unit = Column(String, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 