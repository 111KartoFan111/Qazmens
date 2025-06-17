from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import List

Base = declarative_base()

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, index=True)
    area = Column(Float)
    floor_level = Column(Integer)
    condition = Column(String)
    distance_from_center = Column(Float)
    renovation_status = Column(String)
    features = Column(JSON)
    price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    valuations = relationship("Valuation", back_populates="property")

class Valuation(Base):
    __tablename__ = "valuations"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    final_valuation = Column(Float)
    mean_price = Column(Float)
    median_price = Column(Float)
    standard_deviation = Column(Float)
    comparable_adjustments = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="valuations") 