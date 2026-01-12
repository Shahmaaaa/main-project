"""
Severity Score Calculator
Combines AI predictions with additional disaster parameters
"""

import numpy as np
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class SeverityScoreCalculator:
    """
    Calculate overall disaster severity score using weighted scoring mechanism
    """
    
    def __init__(self):
        # Weights for different factors
        self.weights = {
            'image_analysis': 0.40,      # CNN prediction
            'rainfall_intensity': 0.10,  # Simulated rainfall
            'water_level': 0.10,         # Water level/magnitude
            'population_affected': 0.15, # Population impacted
            'infrastructure_damage': 0.15, # Infrastructure damage
            'impact_area': 0.10          # Area of impact
        }
        
        # Severity thresholds
        self.thresholds = {
            'low': (0, 40),      # 0-40: Low damage
            'medium': (41, 70),  # 41-70: Medium damage
            'high': (71, 100)    # 71-100: High damage
        }
    
    def normalize_value(self, value: float, min_val: float, max_val: float) -> float:
        """Normalize value to 0-100 scale"""
        if max_val == min_val:
            return 50
        normalized = ((value - min_val) / (max_val - min_val)) * 100
        return min(100, max(0, normalized))
    
    def calculate_image_score(self, ai_predictions: Dict[str, float]) -> float:
        """
        Calculate severity score from AI model predictions
        ai_predictions: {'low': float, 'medium': float, 'high': float}
        """
        low_prob = ai_predictions.get('low', 0)
        medium_prob = ai_predictions.get('medium', 0)
        high_prob = ai_predictions.get('high', 0)
        
        # Weighted combination
        image_score = (low_prob * 20) + (medium_prob * 60) + (high_prob * 100)
        return min(100, max(0, image_score))
    
    def calculate_rainfall_score(self, rainfall_mm: float) -> float:
        """Convert rainfall intensity to severity score"""
        # Thresholds: 0-50mm low, 50-150mm medium, 150+ high
        if rainfall_mm < 50:
            return self.normalize_value(rainfall_mm, 0, 50) * 0.5
        elif rainfall_mm < 150:
            return 20 + self.normalize_value(rainfall_mm, 50, 150) * 0.4
        else:
            return 60 + min(40, (rainfall_mm - 150) / 100 * 10)
    
    def calculate_water_level_score(self, water_level_cm: float) -> float:
        """Convert water level to severity score"""
        # Thresholds: 0-30cm low, 30-100cm medium, 100+ high
        if water_level_cm < 30:
            return self.normalize_value(water_level_cm, 0, 30) * 0.4
        elif water_level_cm < 100:
            return 15 + self.normalize_value(water_level_cm, 30, 100) * 0.5
        else:
            return 65 + min(35, (water_level_cm - 100) / 100 * 10)
    
    def calculate_population_score(self, population_affected: int) -> float:
        """Convert population affected to severity score"""
        # Thresholds: 0-1000 low, 1000-10000 medium, 10000+ high
        if population_affected < 1000:
            return self.normalize_value(population_affected, 0, 1000) * 0.3
        elif population_affected < 10000:
            return 10 + self.normalize_value(population_affected, 1000, 10000) * 0.6
        else:
            return 70 + min(30, np.log10(population_affected - 10000) * 5)
    
    def calculate_infrastructure_score(self, damage_percentage: float) -> float:
        """Convert infrastructure damage to severity score"""
        # Normalize 0-100% to 0-100 scale
        return self.normalize_value(damage_percentage, 0, 100)
    
    def calculate_impact_area_score(self, area_sqkm: float) -> float:
        """Convert impact area to severity score"""
        # Thresholds: 0-10 low, 10-50 medium, 50+ high
        if area_sqkm < 10:
            return self.normalize_value(area_sqkm, 0, 10) * 0.4
        elif area_sqkm < 50:
            return 15 + self.normalize_value(area_sqkm, 10, 50) * 0.5
        else:
            return 65 + min(35, np.log10(area_sqkm) * 10)
    
    def calculate_total_score(
        self,
        ai_predictions: Dict[str, float],
        rainfall_mm: float = 0,
        water_level_cm: float = 0,
        population_affected: int = 0,
        infrastructure_damage: float = 0,
        impact_area: float = 0
    ) -> Dict:
        """
        Calculate total severity score using weighted combination
        
        Returns:
            Dict with total_score, component_scores, and severity_level
        """
        
        # Calculate individual component scores
        component_scores = {
            'image_analysis': self.calculate_image_score(ai_predictions),
            'rainfall_intensity': self.calculate_rainfall_score(rainfall_mm),
            'water_level': self.calculate_water_level_score(water_level_cm),
            'population_affected': self.calculate_population_score(population_affected),
            'infrastructure_damage': self.calculate_infrastructure_score(infrastructure_damage),
            'impact_area': self.calculate_impact_area_score(impact_area)
        }
        
        # Calculate weighted total
        total_score = sum(
            component_scores[key] * self.weights[key]
            for key in self.weights.keys()
        )
        
        # Determine severity level
        severity_level = self._get_severity_level(total_score)
        
        return {
            'total_score': round(total_score, 2),
            'severity_level': severity_level,
            'component_scores': {k: round(v, 2) for k, v in component_scores.items()},
            'weights': self.weights,
            'confidence': self._calculate_confidence(component_scores)
        }
    
    def _get_severity_level(self, score: float) -> str:
        """Determine severity level from score"""
        if score <= 40:
            return 'LOW'
        elif score <= 70:
            return 'MEDIUM'
        else:
            return 'HIGH'
    
    def _calculate_confidence(self, component_scores: Dict[str, float]) -> float:
        """
        Calculate confidence in severity assessment
        Higher consistency = higher confidence
        """
        scores = list(component_scores.values())
        mean_score = np.mean(scores)
        variance = np.var(scores)
        # Confidence = 1 - normalized variance
        confidence = max(0.5, 1 - (variance / 2500))  # Normalize variance
        return round(confidence, 2)

# Example usage
if __name__ == "__main__":
    calculator = SeverityScoreCalculator()
    
    # Example disaster assessment
    ai_predictions = {
        'low': 0.1,
        'medium': 0.3,
        'high': 0.6
    }
    
    result = calculator.calculate_total_score(
        ai_predictions=ai_predictions,
        rainfall_mm=120,
        water_level_cm=85,
        population_affected=5000,
        infrastructure_damage=65,
        impact_area=35
    )
    
    print(f"Total Severity Score: {result['total_score']}")
    print(f"Severity Level: {result['severity_level']}")
    print(f"Component Scores: {result['component_scores']}")
    print(f"Confidence: {result['confidence']}")
