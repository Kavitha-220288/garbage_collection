'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, LocateFixed, Check } from 'lucide-react';
import type LType from 'leaflet';
import { createPinPickerIcon } from './leaflet-icons';

interface LeafletMapPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  wardName: string;
  onChangeLocation: (location: { latitude: number; longitude: number; address: string; wardName: string }) => void;
  height?: string;
}

export function LeafletMapPicker({
  latitude,
  longitude,
  address,
  wardName,
  onChangeLocation,
  height = 'h-64',
}: LeafletMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const markerRef = useRef<LType.Marker | null>(null);
  const leafletRef = useRef<typeof LType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const presetLocations = [
    { name: 'Maisammaguda (Malla Reddy Campus)', ward: 'Ward 1 (Maisammaguda)', lat: 17.5615, lng: 78.4485 },
    { name: 'Dulapally Village Circle', ward: 'Ward 2 (Dulapally)', lat: 17.5580, lng: 78.4410 },
    { name: 'Gundlapochampally Station Road', ward: 'Ward 3 (Gundlapochampally)', lat: 17.5680, lng: 78.4550 },
    { name: 'Kompally Highway Junction (NH-44)', ward: 'Ward 4 (Kompally)', lat: 17.5450, lng: 78.4890 },
    { name: 'Bahadurpally X Roads', ward: 'Ward 5 (Bahadurpally)', lat: 17.5410, lng: 78.4320 },
  ];

  useEffect(() => {
    let mounted = true;
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (!mounted || !mapContainerRef.current || mapInstanceRef.current) return;

      leafletRef.current = L;

      const initialLat = latitude || 17.5615;
      const initialLng = longitude || 78.4485;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      const pinIcon = createPinPickerIcon(L);
      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup(`<b>${address || 'Selected Location'}</b><br/>${wardName || 'GHMC Maisammaguda Zone'}`).openPopup();

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        const closestPreset = presetLocations.reduce((prev, curr) => {
          const distPrev = Math.hypot(prev.lat - position.lat, prev.lng - position.lng);
          const distCurr = Math.hypot(curr.lat - position.lat, curr.lng - position.lng);
          return distCurr < distPrev ? curr : prev;
        }, presetLocations[0]);

        const updatedAddress = `Near GPS (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`;
        const updatedWard = closestPreset ? closestPreset.ward : 'GHMC Maisammaguda Ward';

        marker.setPopupContent(`<b>${updatedAddress}</b><br/>${updatedWard}`);

        onChangeLocation({
          latitude: Number(position.lat.toFixed(6)),
          longitude: Number(position.lng.toFixed(6)),
          address: updatedAddress,
          wardName: updatedWard,
        });
      });

      map.on('click', (e: LType.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);

        const closestPreset = presetLocations.reduce((prev, curr) => {
          const distPrev = Math.hypot(prev.lat - lat, prev.lng - lng);
          const distCurr = Math.hypot(curr.lat - lat, curr.lng - lng);
          return distCurr < distPrev ? curr : prev;
        }, presetLocations[0]);

        const updatedAddress = `Near GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        const updatedWard = closestPreset ? closestPreset.ward : 'GHMC Maisammaguda Ward';

        marker.setPopupContent(`<b>${updatedAddress}</b><br/>${updatedWard}`).openPopup();

        onChangeLocation({
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          address: updatedAddress,
          wardName: updatedWard,
        });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setIsLoaded(true);
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && (latitude || longitude)) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - latitude) > 0.0001 || Math.abs(currentPos.lng - longitude) > 0.0001) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.setPopupContent(`<b>${address}</b><br/>${wardName}`);
        mapInstanceRef.current.flyTo([latitude, longitude], 16, { animate: true, duration: 1 });
      }
    }
  }, [latitude, longitude, address, wardName]);

  const handleLocateCurrentPosition = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const currentAddress = `Current GPS Location (${lat}°N, ${lng}°E)`;
          const currentWard = 'Local Ward Area';

          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            markerRef.current.setPopupContent(`<b>${currentAddress}</b><br/>${currentWard}`).openPopup();
            mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true });
          }

          onChangeLocation({
            latitude: lat,
            longitude: lng,
            address: currentAddress,
            wardName: currentWard,
          });
        },
        (error) => {
          console.warn('GPS Geolocation permission denied or failed:', error);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && latitude && longitude) {
      mapInstanceRef.current.flyTo([latitude, longitude], 16, { animate: true });
    } else {
      handleLocateCurrentPosition();
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-foreground">Interactive Leaflet GIS Map Location Picker</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleLocateCurrentPosition}
            className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            <Compass className="h-3.5 w-3.5 text-indigo-600 animate-spin" />
            <span>Locate My Current GPS</span>
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            className="p-1 rounded bg-muted hover:bg-accent text-foreground transition-colors"
            title="Recenter Pin"
          >
            <LocateFixed className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg border border-border shadow-inner">
        <div ref={mapContainerRef} className={`w-full ${height} z-0`} />

        <div className="absolute top-2 left-2 z-[400] flex items-center gap-2 pointer-events-none">
          <span className="bg-slate-900/90 text-emerald-400 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md border border-slate-700 shadow-md backdrop-blur-xs">
            LAT: {latitude.toFixed(4)}° N &bull; LON: {longitude.toFixed(4)}° E
          </span>
          <span className="bg-primary text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-md">
            {wardName}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Quick Landmark / Ward Pin Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {presetLocations.map((p) => {
            const isSelected = Math.abs(p.lat - latitude) < 0.001 && Math.abs(p.lng - longitude) < 0.001;
            return (
              <button
                type="button"
                key={p.name}
                onClick={() =>
                  onChangeLocation({
                    latitude: p.lat,
                    longitude: p.lng,
                    address: p.name,
                    wardName: p.ward,
                  })
                }
                className={`flex items-center justify-between rounded-lg p-2 text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'border border-input bg-card text-foreground hover:bg-muted'
                }`}
              >
                <div>
                  <p className="font-semibold flex items-center gap-1">
                    {p.name}
                    {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
                  </p>
                  <p className={`text-[10px] ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>{p.ward}</p>
                </div>
                <Navigation className={`h-3.5 w-3.5 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
