from sqlalchemy.orm import Session
from typing import List, Dict, Any
import models
import schemas
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from scipy import stats
import json

class AnalyticsService:
    def get_market_trends(
        self,
        db: Session,
        property_type: str = None,
        area_min: float = None,
        area_max: float = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Analyze market trends for properties
        """
        # Get properties within date range
        date_threshold = datetime.utcnow() - timedelta(days=days)
        query = db.query(models.Property)\
            .filter(models.Property.created_at >= date_threshold)

        if property_type:
            query = query.filter(models.Property.property_type == property_type)
        if area_min:
            query = query.filter(models.Property.area >= area_min)
        if area_max:
            query = query.filter(models.Property.area <= area_max)

        properties = query.all()

        if not properties:
            return {
                "error": "No properties found for the specified criteria"
            }

        # Convert to DataFrame for analysis
        df = pd.DataFrame([{
            "price": p.price,
            "area": p.area,
            "floor": p.floor_level,
            "total_floors": p.total_floors,
            "condition": p.condition,
            "renovation": p.renovation_status,
            "created_at": p.created_at
        } for p in properties])

        # Calculate price per square meter
        df["price_per_sqm"] = df["price"] / df["area"]

        # Basic statistics
        stats = {
            "total_properties": len(properties),
            "price_stats": {
                "mean": float(df["price"].mean()),
                "median": float(df["price"].median()),
                "std": float(df["price"].std()),
                "min": float(df["price"].min()),
                "max": float(df["price"].max())
            },
            "price_per_sqm_stats": {
                "mean": float(df["price_per_sqm"].mean()),
                "median": float(df["price_per_sqm"].median()),
                "std": float(df["price_per_sqm"].std()),
                "min": float(df["price_per_sqm"].min()),
                "max": float(df["price_per_sqm"].max())
            }
        }

        # Price distribution by condition
        condition_stats = df.groupby("condition")["price"].agg([
            "count", "mean", "median", "std"
        ]).to_dict("index")
        stats["condition_stats"] = condition_stats

        # Price distribution by renovation status
        renovation_stats = df.groupby("renovation")["price"].agg([
            "count", "mean", "median", "std"
        ]).to_dict("index")
        stats["renovation_stats"] = renovation_stats

        # Price trends over time
        df["date"] = pd.to_datetime(df["created_at"]).dt.date
        daily_stats = df.groupby("date")["price"].agg([
            "count", "mean", "median"
        ]).to_dict("index")
        stats["daily_trends"] = daily_stats

        return stats

    def get_property_comparison(
        self,
        db: Session,
        property_id: int,
        radius_km: float = 5.0
    ) -> Dict[str, Any]:
        """
        Compare property with similar properties in the area
        """
        # Get subject property
        subject = db.query(models.Property).filter(models.Property.id == property_id).first()
        if not subject:
            return {"error": "Property not found"}

        # Get nearby properties
        nearby = db.query(models.Property)\
            .filter(models.Property.id != property_id)\
            .filter(models.Property.property_type == subject.property_type)\
            .all()

        if not nearby:
            return {"error": "No comparable properties found"}

        # Convert to DataFrame
        df = pd.DataFrame([{
            "id": p.id,
            "price": p.price,
            "area": p.area,
            "floor": p.floor_level,
            "total_floors": p.total_floors,
            "condition": p.condition,
            "renovation": p.renovation_status
        } for p in nearby])

        # Calculate price per square meter
        df["price_per_sqm"] = df["price"] / df["area"]

        # Calculate similarity scores
        similarity_scores = []
        for _, comp in df.iterrows():
            score = self._calculate_similarity_score(subject, comp)
            similarity_scores.append(score)

        df["similarity_score"] = similarity_scores

        # Sort by similarity
        df = df.sort_values("similarity_score", ascending=False)

        # Get top 5 most similar properties
        top_comparables = df.head(5).to_dict("records")

        # Calculate price ranges
        price_ranges = {
            "similar": {
                "min": float(df[df["similarity_score"] > 0.7]["price"].min()),
                "max": float(df[df["similarity_score"] > 0.7]["price"].max()),
                "mean": float(df[df["similarity_score"] > 0.7]["price"].mean()),
                "median": float(df[df["similarity_score"] > 0.7]["price"].median())
            },
            "all": {
                "min": float(df["price"].min()),
                "max": float(df["price"].max()),
                "mean": float(df["price"].mean()),
                "median": float(df["price"].median())
            }
        }

        return {
            "subject_property": {
                "id": subject.id,
                "price": subject.price,
                "area": subject.area,
                "price_per_sqm": subject.price / subject.area,
                "condition": subject.condition,
                "renovation": subject.renovation_status
            },
            "comparable_properties": top_comparables,
            "price_ranges": price_ranges,
            "total_comparables": len(nearby)
        }

    def _calculate_similarity_score(
        self,
        subject: models.Property,
        comparable: pd.Series
    ) -> float:
        """
        Calculate similarity score between two properties
        """
        # Area similarity (normalized)
        area_diff = abs(subject.area - comparable["area"]) / max(subject.area, comparable["area"])
        area_score = 1 - area_diff

        # Floor similarity (normalized)
        floor_diff = abs(
            subject.floor_level / subject.total_floors -
            comparable["floor"] / comparable["total_floors"]
        )
        floor_score = 1 - floor_diff

        # Condition similarity
        condition_scores = {
            "excellent": 1.0,
            "good": 0.8,
            "fair": 0.6,
            "poor": 0.4
        }
        condition_score = 1 - abs(
            condition_scores[subject.condition] -
            condition_scores[comparable["condition"]]
        )

        # Renovation similarity
        renovation_scores = {
            "new": 1.0,
            "renovated": 0.8,
            "partial": 0.6,
            "none": 0.4
        }
        renovation_score = 1 - abs(
            renovation_scores[subject.renovation_status] -
            renovation_scores[comparable["renovation"]]
        )

        # Weighted average
        weights = {
            "area": 0.4,
            "floor": 0.2,
            "condition": 0.2,
            "renovation": 0.2
        }

        similarity = (
            area_score * weights["area"] +
            floor_score * weights["floor"] +
            condition_score * weights["condition"] +
            renovation_score * weights["renovation"]
        )

        return similarity

    def get_adjustment_analysis(
        self,
        db: Session,
        property_id: int
    ) -> Dict[str, Any]:
        """
        Analyze adjustment coefficients for a property
        """
        # Get property
        property = db.query(models.Property).filter(models.Property.id == property_id).first()
        if not property:
            return {"error": "Property not found"}

        # Get valuation history
        valuations = db.query(models.ValuationHistory)\
            .filter(models.ValuationHistory.property_id == property_id)\
            .order_by(models.ValuationHistory.valuation_date.desc())\
            .all()

        if not valuations:
            return {"error": "No valuation history found"}

        # Analyze adjustments
        adjustment_stats = {}
        for valuation in valuations:
            for comp_id, adjustments in valuation.adjustments.items():
                for adj in adjustments:
                    if adj.feature not in adjustment_stats:
                        adjustment_stats[adj.feature] = []
                    adjustment_stats[adj.feature].append(adj.value)

        # Calculate statistics for each adjustment
        analysis = {}
        for feature, values in adjustment_stats.items():
            analysis[feature] = {
                "count": len(values),
                "mean": float(np.mean(values)),
                "median": float(np.median(values)),
                "std": float(np.std(values)),
                "min": float(np.min(values)),
                "max": float(np.max(values))
            }

        return {
            "property_id": property_id,
            "total_valuations": len(valuations),
            "adjustment_analysis": analysis
        }

analytics_service = AnalyticsService() 