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
    { name: 'Jagadamba Center (Main Market)', ward: 'Ward 4 (Jagadamba)', lat: 17.7121, lng: 83.3012 },
    { name: 'Gajuwaka Market Road', ward: 'Ward 12 (Gajuwaka)', lat: 17.6892, lng: 83.2145 },
    { name: 'MVP Colony Sector 5', ward: 'Ward 2 (MVP Colony)', lat: 17.7412, lng: 83.3321 },
    { name: 'Beach Road (Fisheries Market)', ward: 'Ward 1 (Beach Road)', lat: 17.7188, lng: 83.3245 },
    { name: 'NAD Junction Market', ward: 'Ward 15 (NAD)', lat: 17.7301, lng: 83.2456 },
  ];

  useEffect(() => {
    let mounted = true;
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (!mounted || !mapContainerRef.current || mapInstanceRef.current) return;

      leafletRef.current = L;

      const initialLat = latitude || 17.7121;
      const initialLng = longitude || 83.3012;

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

      marker.bindPopup(`<b>${address || 'Selected Location'}</b><br/>${wardName || 'Visakhapatnam Zone'}`).openPopup();

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        const closestPreset = presetLocations.reduce((prev, curr) => {
          const distPrev = Math.hypot(prev.lat - position.lat, prev.lng - position.lng);
          const distCurr = Math.hypot(curr.lat - position.lat, curr.lng - position.lng);
          return distCurr < distPrev ? curr : prev;
        }, presetLocations[0]);

        const updatedAddress = `Near GPS (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`;
        const updatedWard = closestPreset ? closestPreset.ward : 'Visakhapatnam Municipal Ward';

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
        const updatedWard = closestPreset ? closestPreset.ward : 'Visakhapatnam Municipal Ward';

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

  const handleRecenter = () => {
    if (mapInstanceRef.current && latitude && longitude) {
      mapInstanceRef.current.flyTo([latitude, longitude], 16, { animate: true });
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
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            OpenStreetMap Engine
          </span>
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
