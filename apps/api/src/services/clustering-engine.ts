import { Incident } from '@smartwaste360/contracts';

/**
 * Calculate Haversine distance in meters between two GPS coordinates
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface ClusteringConfig {
  radiusMeters: number; // e.g. 100 meters
  timeWindowMinutes: number; // e.g. 120 minutes (2 hours)
}

export const DEFAULT_CLUSTERING_CONFIG: ClusteringConfig = {
  radiusMeters: 100,
  timeWindowMinutes: 120,
};

/**
 * Finds if an incoming report matches an existing active incident
 */
export function findMatchingIncident(
  latitude: number,
  longitude: number,
  submittedAtIso: string,
  activeIncidents: Incident[],
  config: ClusteringConfig = DEFAULT_CLUSTERING_CONFIG
): { incident: Incident; distanceMeters: number; timeDiffMinutes: number } | null {
  const reportTime = new Date(submittedAtIso).getTime();

  for (const incident of activeIncidents) {
    // Only cluster active/open incidents (not resolved ones)
    if (incident.status === 'RESOLVED') continue;

    const distance = calculateHaversineDistanceMeters(
      latitude,
      longitude,
      incident.latitude,
      incident.longitude
    );

    const incidentTime = new Date(incident.createdAt).getTime();
    const timeDiffMinutes = Math.abs(reportTime - incidentTime) / (1000 * 60);

    if (distance <= config.radiusMeters && timeDiffMinutes <= config.timeWindowMinutes) {
      return { incident, distanceMeters: distance, timeDiffMinutes: Math.round(timeDiffMinutes) };
    }
  }

  return null;
}
