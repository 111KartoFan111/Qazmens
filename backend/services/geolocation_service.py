from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
import models
import schemas
from datetime import datetime
import math
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import requests
import os

class GeolocationService:
    def __init__(self):
        self.geocoder = Nominatim(user_agent="real_estate_app")
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    def geocode_address(
        self,
        address: str
    ) -> Optional[Tuple[float, float]]:
        """
        Convert address to coordinates using Nominatim
        """
        try:
            location = self.geocoder.geocode(address)
            if location:
                return (location.latitude, location.longitude)
            return None
        except Exception as e:
            print(f"Geocoding error: {str(e)}")
            return None

    def reverse_geocode(
        self,
        lat: float,
        lng: float
    ) -> Optional[str]:
        """
        Convert coordinates to address using Nominatim
        """
        try:
            location = self.geocoder.reverse(f"{lat}, {lng}")
            if location:
                return location.address
            return None
        except Exception as e:
            print(f"Reverse geocoding error: {str(e)}")
            return None

    def calculate_distance(
        self,
        point1: Tuple[float, float],
        point2: Tuple[float, float]
    ) -> float:
        """
        Calculate distance between two points in kilometers
        """
        return geodesic(point1, point2).kilometers

    def find_nearby_properties(
        self,
        db: Session,
        lat: float,
        lng: float,
        radius_km: float = 5.0,
        limit: int = 10
    ) -> List[models.Property]:
        """
        Find properties within specified radius
        """
        properties = db.query(models.Property).all()
        nearby_properties = []

        for property in properties:
            if property.location:
                distance = self.calculate_distance(
                    (lat, lng),
                    (property.location.lat, property.location.lng)
                )
                if distance <= radius_km:
                    nearby_properties.append((property, distance))

        # Sort by distance and limit results
        nearby_properties.sort(key=lambda x: x[1])
        return [p[0] for p in nearby_properties[:limit]]

    def get_place_details(
        self,
        place_id: str
    ) -> Optional[dict]:
        """
        Get detailed information about a place using Google Places API
        """
        if not self.api_key:
            return None

        try:
            url = f"https://maps.googleapis.com/maps/api/place/details/json"
            params = {
                "place_id": place_id,
                "key": self.api_key
            }
            response = requests.get(url, params=params)
            data = response.json()

            if data["status"] == "OK":
                return data["result"]
            return None
        except Exception as e:
            print(f"Error fetching place details: {str(e)}")
            return None

    def search_places(
        self,
        query: str,
        lat: float,
        lng: float,
        radius_meters: int = 5000
    ) -> List[dict]:
        """
        Search for places near coordinates using Google Places API
        """
        if not self.api_key:
            return []

        try:
            url = f"https://maps.googleapis.com/maps/api/place/textsearch/json"
            params = {
                "query": query,
                "location": f"{lat},{lng}",
                "radius": radius_meters,
                "key": self.api_key
            }
            response = requests.get(url, params=params)
            data = response.json()

            if data["status"] == "OK":
                return data["results"]
            return []
        except Exception as e:
            print(f"Error searching places: {str(e)}")
            return []

    def get_route(
        self,
        origin: Tuple[float, float],
        destination: Tuple[float, float],
        mode: str = "driving"
    ) -> Optional[dict]:
        """
        Get route between two points using Google Directions API
        """
        if not self.api_key:
            return None

        try:
            url = f"https://maps.googleapis.com/maps/api/directions/json"
            params = {
                "origin": f"{origin[0]},{origin[1]}",
                "destination": f"{destination[0]},{destination[1]}",
                "mode": mode,
                "key": self.api_key
            }
            response = requests.get(url, params=params)
            data = response.json()

            if data["status"] == "OK":
                return data["routes"][0]
            return None
        except Exception as e:
            print(f"Error getting route: {str(e)}")
            return None

    def get_area_info(
        self,
        lat: float,
        lng: float
    ) -> dict:
        """
        Get information about the area around coordinates
        """
        area_info = {
            "schools": self.search_places("school", lat, lng),
            "hospitals": self.search_places("hospital", lat, lng),
            "shopping": self.search_places("shopping mall", lat, lng),
            "transportation": self.search_places("bus station", lat, lng),
            "parks": self.search_places("park", lat, lng)
        }

        # Calculate distances to nearest amenities
        distances = {}
        for category, places in area_info.items():
            if places:
                nearest = min(
                    places,
                    key=lambda p: self.calculate_distance(
                        (lat, lng),
                        (p["geometry"]["location"]["lat"],
                         p["geometry"]["location"]["lng"])
                    )
                )
                distances[category] = self.calculate_distance(
                    (lat, lng),
                    (nearest["geometry"]["location"]["lat"],
                     nearest["geometry"]["location"]["lng"])
                )

        return {
            "amenities": area_info,
            "distances": distances
        }

geolocation_service = GeolocationService() 