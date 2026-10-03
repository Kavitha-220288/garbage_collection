'use client';

import React, { useEffect, useRef, useState } from 'react';
import type LType from 'leaflet';
import {
  Layers,
  Truck,
  Trash2,
  AlertTriangle,
  Building2,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  X,
  Navigation,
  Activity,
  Compass,
} from 'lucide-react';
import {
  createVehicleIcon,
  createBinIcon,
  createIncidentIcon,
  createFacilityIcon,
} from './leaflet-icons';

export interface MapVehicle {
  id: string;
  vehicleId: string;
  driverName: string;
  type: 'Compactor' | 'Sweeper' | 'E-Tipper';
  status: 'AVAILABLE' | 'EN_ROUTE' | 'COLLECTING' | 'DELAYED' | 'FULL' | 'OFFLINE';
  lat: number;
  lng: number;
  speedKmH: number;
  capacityUsedPercent: number;
  ward: string;
  routePath?: [number, number][];
}

export interface MapBin {
  id: string;
  binId: string;
  locationName: string;
  ward: string;
  fillLevelPercent: number;
  tempCelsius: number;
  lat: number;
  lng: number;
  status: 'NORMAL' | 'WARNING' | 'OVERFLOWING';
  lastSync: string;
}

export interface MapIncident {
  id: string;
  title: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  lat: number;
  lng: number;
  ward: string;
  status: 'SUBMITTED' | 'ASSIGNED' | 'EN_ROUTE' | 'VERIFIED' | 'RESOLVED';
  reportedAt: string;
}

export interface MapFacility {
  id: string;
  name: string;
  type: 'MRF' | 'Transfer Station' | 'Landfill';
  capacityTonsDay: number;
  lat: number;
  lng: number;
  ward: string;
}

interface LeafletGisMapProps {
  vehicles?: MapVehicle[];
  bins?: MapBin[];
  incidents?: MapIncident[];
  facilities?: MapFacility[];
  height?: string;
  initialWard?: string;
  onSelectEntity?: (type: 'vehicle' | 'bin' | 'incident' | 'facility', entity: any) => void;
}

const wardBoundaries = [
  {
    name: 'Ward 1 (Maisammaguda College Zone)',
    cleanlinessScore: 92,
    color: '#10b981',
    coordinates: [
      [17.555, 78.440],
      [17.570, 78.442],
      [17.572, 78.458],
      [17.556, 78.455],
    ],
  },
  {
    name: 'Ward 2 (Dulapally Village Circle)',
    cleanlinessScore: 88,
    color: '#059669',
    coordinates: [
      [17.545, 78.430],
      [17.562, 78.432],
      [17.564, 78.445],
      [17.547, 78.442],
    ],
  },
  {
    name: 'Ward 3 (Gundlapochampally Station)',
    cleanlinessScore: 85,
    color: '#10b981',
    coordinates: [
      [17.560, 78.450],
      [17.575, 78.452],
      [17.578, 78.468],
      [17.562, 78.465],
    ],
  },
  {
    name: 'Ward 4 (Kompally Highway Junction)',
    cleanlinessScore: 79,
    color: '#f59e0b',
    coordinates: [
      [17.535, 78.475],
      [17.555, 78.478],
      [17.558, 78.495],
      [17.538, 78.492],
    ],
  },
  {
    name: 'Ward 5 (Bahadurpally X-Roads)',
    cleanlinessScore: 83,
    color: '#3b82f6',
    coordinates: [
      [17.530, 78.420],
      [17.548, 78.422],
      [17.550, 78.438],
      [17.532, 78.435],
    ],
  },
];

const defaultVehicles: MapVehicle[] = [
  {
    id: 'v1',
    vehicleId: 'Vehicle V-12',
    driverName: 'Ravi Kumar',
    type: 'Compactor',
    status: 'COLLECTING',
    lat: 17.5615,
    lng: 78.4485,
    speedKmH: 26,
    capacityUsedPercent: 65,
    ward: 'Ward 1 (Maisammaguda)',
    routePath: [
      [17.556, 78.442],
      [17.5615, 78.4485],
      [17.565, 78.452],
      [17.570, 78.456],
    ],
  },
  {
    id: 'v2',
    vehicleId: 'Vehicle V-08',
    driverName: 'Srinivas M.',
    type: 'Sweeper',
    status: 'EN_ROUTE',
    lat: 17.5580,
    lng: 78.4410,
    speedKmH: 20,
    capacityUsedPercent: 40,
    ward: 'Ward 2 (Dulapally)',
  },
  {
    id: 'v3',
    vehicleId: 'Vehicle V-03',
    driverName: 'K. Prasad',
    type: 'E-Tipper',
    status: 'AVAILABLE',
    lat: 17.5680,
    lng: 78.4550,
    speedKmH: 0,
    capacityUsedPercent: 10,
    ward: 'Ward 3 (Gundlapochampally)',
  },
  {
    id: 'v4',
    vehicleId: 'Vehicle V-19',
    driverName: 'M. Naidu',
    type: 'Compactor',
    status: 'FULL',
    lat: 17.5450,
    lng: 78.4890,
    speedKmH: 34,
    capacityUsedPercent: 96,
    ward: 'Ward 4 (Kompally)',
  },
  {
    id: 'v5',
    vehicleId: 'Vehicle V-22',
    driverName: 'A. Reddy',
    type: 'E-Tipper',
    status: 'COLLECTING',
    lat: 17.5410,
    lng: 78.4320,
    speedKmH: 15,
    capacityUsedPercent: 55,
    ward: 'Ward 5 (Bahadurpally)',
  },
];

const defaultBins: MapBin[] = [
  {
    id: 'b1',
    binId: 'BIN-108',
    locationName: 'Maisammaguda Malla Reddy Campus Main Gate',
    ward: 'Ward 1',
    fillLevelPercent: 92,
    tempCelsius: 32,
    lat: 17.5615,
    lng: 78.4485,
    status: 'OVERFLOWING',
    lastSync: '2 mins ago',
  },
  {
    id: 'b2',
    binId: 'BIN-104',
    locationName: 'Dulapally Village Circle Market',
    ward: 'Ward 2',
    fillLevelPercent: 45,
    tempCelsius: 28,
    lat: 17.5580,
    lng: 78.4410,
    status: 'NORMAL',
    lastSync: '5 mins ago',
  },
  {
    id: 'b3',
    binId: 'BIN-210',
    locationName: 'Gundlapochampally Railway Crossing Gate',
    ward: 'Ward 3',
    fillLevelPercent: 78,
    tempCelsius: 30,
    lat: 17.5680,
    lng: 78.4550,
    status: 'WARNING',
    lastSync: '1 min ago',
  },
  {
    id: 'b4',
    binId: 'BIN-088',
    locationName: 'Kompally NH-44 Highway Commercial Hub',
    ward: 'Ward 4',
    fillLevelPercent: 94,
    tempCelsius: 35,
    lat: 17.5450,
    lng: 78.4890,
    status: 'OVERFLOWING',
    lastSync: 'Just now',
  },
  {
    id: 'b5',
    binId: 'BIN-412',
    locationName: 'Bahadurpally X-Roads Bus Shelter',
    ward: 'Ward 5',
    fillLevelPercent: 81,
    tempCelsius: 31,
    lat: 17.5410,
    lng: 78.4320,
    status: 'WARNING',
    lastSync: '3 mins ago',
  },
];

const defaultIncidents: MapIncident[] = [
  {
    id: 'INC-2026-089',
    title: 'Illegal Commercial Dumping behind Maisammaguda Campus',
    category: 'Illegal Dumping',
    priority: 'CRITICAL',
    lat: 17.5622,
    lng: 78.4495,
    ward: 'Ward 1 (Maisammaguda)',
    status: 'VERIFIED',
    reportedAt: '15 mins ago',
  },
  {
    id: 'INC-2026-092',
    title: 'Overflowing Bin near Dulapally Bus Stop',
    category: 'Overflowing Bin',
    priority: 'HIGH',
    lat: 17.5575,
    lng: 78.4402,
    ward: 'Ward 2 (Dulapally)',
    status: 'ASSIGNED',
    reportedAt: '40 mins ago',
  },
  {
    id: 'INC-2026-095',
    title: 'Drainage Debris Accumulation near Kompally Highway',
    category: 'Drainage / Litter',
    priority: 'HIGH',
    lat: 17.5445,
    lng: 78.4880,
    ward: 'Ward 4 (Kompally)',
    status: 'EN_ROUTE',
    reportedAt: '25 mins ago',
  },
];

const defaultFacilities: MapFacility[] = [
  {
    id: 'f1',
    name: 'Jawaharnagar Waste Management & MRF Facility (#1)',
    type: 'MRF',
    capacityTonsDay: 450,
    lat: 17.5250,
    lng: 78.5680,
    ward: 'GHMC Jawaharnagar Zone',
  },
  {
    id: 'f2',
    name: 'Maisammaguda Waste Transfer Station',
    type: 'Transfer Station',
    capacityTonsDay: 200,
    lat: 17.5640,
    lng: 78.4460,
    ward: 'Ward 1 (Maisammaguda)',
  },
];

export function LeafletGisMap({
  vehicles = defaultVehicles,
  bins = defaultBins,
  incidents = defaultIncidents,
  facilities = defaultFacilities,
  height = 'h-[550px]',
  initialWard,
  onSelectEntity,
}: LeafletGisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const leafletRef = useRef<typeof LType | null>(null);

  const vehicleLayerRef = useRef<LType.LayerGroup | null>(null);
  const binLayerRef = useRef<LType.LayerGroup | null>(null);
  const incidentLayerRef = useRef<LType.LayerGroup | null>(null);
  const facilityLayerRef = useRef<LType.LayerGroup | null>(null);
  const wardLayerRef = useRef<LType.LayerGroup | null>(null);
  const routeLayerRef = useRef<LType.LayerGroup | null>(null);

  const [showVehicles, setShowVehicles] = useState(true);
  const [showBins, setShowBins] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showWards, setShowWards] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  const [tileStyle, setTileStyle] = useState<'osm' | 'dark' | 'light'>('osm');
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const [liveVehicles, setLiveVehicles] = useState<MapVehicle[]>(vehicles);

  const [selectedEntity, setSelectedEntity] = useState<{ type: string; data: any } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const tileLayersRef = useRef<{ [key: string]: LType.TileLayer }>({});

  useEffect(() => {
    let mounted = true;
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (!mounted || !mapContainerRef.current || mapRef.current) return;

      leafletRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: [17.5615, 78.4485],
        zoom: 14,
        zoomControl: false,
      });

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      });

      const dark = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; Esri Topo Map',
      });

      const light = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; Esri World Imagery',
      });

      tileLayersRef.current = { osm, dark, light };
      osm.addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      wardLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);
      facilityLayerRef.current = L.layerGroup().addTo(map);
      binLayerRef.current = L.layerGroup().addTo(map);
      incidentLayerRef.current = L.layerGroup().addTo(map);
      vehicleLayerRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
    };

    initMap();

    return () => {
      mounted = false;
      if (simulationRef.current) clearInterval(simulationRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    Object.values(tileLayersRef.current).forEach((layer) => mapRef.current?.removeLayer(layer));
    if (tileLayersRef.current[tileStyle]) {
      tileLayersRef.current[tileStyle].addTo(mapRef.current);
    }
  }, [tileStyle]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!wardLayerRef.current || !L) return;
    wardLayerRef.current.clearLayers();

    if (showWards) {
      wardBoundaries.forEach((ward) => {
        const polygon = L.polygon(ward.coordinates as LType.LatLngExpression[], {
          color: ward.color,
          weight: 2,
          fillColor: ward.color,
          fillOpacity: 0.15,
        });

        polygon.bindTooltip(
          `<b>${ward.name}</b><br/>Cleanliness Score: <span style="color:${ward.color};font-weight:bold">${ward.cleanlinessScore}%</span>`,
          { sticky: true }
        );

        polygon.on('click', () => {
          setSelectedEntity({ type: 'ward', data: ward });
        });

        wardLayerRef.current?.addLayer(polygon);
      });
    }
  }, [showWards, isSimulating]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!routeLayerRef.current || !L) return;
    routeLayerRef.current.clearLayers();

    if (showRoutes) {
      liveVehicles.forEach((v) => {
        if (v.routePath && v.routePath.length > 1) {
          const polyline = L.polyline(v.routePath as LType.LatLngExpression[], {
            color: '#10b981',
            weight: 3,
            dashArray: '6, 6',
            opacity: 0.8,
          });

          polyline.bindTooltip(`<b>Route Path: ${v.vehicleId}</b><br/>Status: ${v.status}`);
          routeLayerRef.current?.addLayer(polyline);
        }
      });
    }
  }, [showRoutes, liveVehicles]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!facilityLayerRef.current || !L) return;
    facilityLayerRef.current.clearLayers();

    if (showFacilities) {
      facilities.forEach((f) => {
        const icon = createFacilityIcon(L, f.type);
        const marker = L.marker([f.lat, f.lng], { icon });

        marker.on('click', () => {
          setSelectedEntity({ type: 'facility', data: f });
          if (onSelectEntity) onSelectEntity('facility', f);
        });

        marker.bindTooltip(`<b>${f.name}</b><br/>Capacity: ${f.capacityTonsDay} T/Day`);
        facilityLayerRef.current?.addLayer(marker);
      });
    }
  }, [showFacilities, facilities]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!binLayerRef.current || !L) return;
    binLayerRef.current.clearLayers();

    if (showBins) {
      bins.forEach((b) => {
        const icon = createBinIcon(L, b.fillLevelPercent);
        const marker = L.marker([b.lat, b.lng], { icon });

        marker.on('click', () => {
          setSelectedEntity({ type: 'bin', data: b });
          if (onSelectEntity) onSelectEntity('bin', b);
        });

        marker.bindTooltip(
          `<b>Bin #${b.binId}</b> - ${b.fillLevelPercent}% Full<br/>${b.locationName}`
        );
        binLayerRef.current?.addLayer(marker);
      });
    }
  }, [showBins, bins]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!incidentLayerRef.current || !L) return;
    incidentLayerRef.current.clearLayers();

    if (showIncidents) {
      incidents.forEach((inc) => {
        const icon = createIncidentIcon(L, inc.priority);
        const marker = L.marker([inc.lat, inc.lng], { icon });

        marker.on('click', () => {
          setSelectedEntity({ type: 'incident', data: inc });
          if (onSelectEntity) onSelectEntity('incident', inc);
        });

        marker.bindTooltip(`<b>[${inc.priority}] ${inc.title}</b><br/>Ward: ${inc.ward}`);
        incidentLayerRef.current?.addLayer(marker);
      });
    }
  }, [showIncidents, incidents]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!vehicleLayerRef.current || !L) return;
    vehicleLayerRef.current.clearLayers();

    if (showVehicles) {
      liveVehicles.forEach((v) => {
        const icon = createVehicleIcon(L, v.status, v.type);
        const marker = L.marker([v.lat, v.lng], { icon });

        marker.on('click', () => {
          setSelectedEntity({ type: 'vehicle', data: v });
          if (onSelectEntity) onSelectEntity('vehicle', v);
        });

        marker.bindTooltip(
          `<b>${v.vehicleId} (${v.type})</b><br/>Driver: ${v.driverName}<br/>Speed: ${v.speedKmH} km/h`
        );
        vehicleLayerRef.current?.addLayer(marker);
      });
    }
  }, [showVehicles, liveVehicles]);

  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationRef.current) clearInterval(simulationRef.current);
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      simulationRef.current = setInterval(() => {
        setLiveVehicles((prev) =>
          prev.map((veh) => {
            const deltaLat = (Math.random() - 0.5) * 0.0015;
            const deltaLng = (Math.random() - 0.5) * 0.0015;
            const newSpeed = Math.round(15 + Math.random() * 25);
            return {
              ...veh,
              lat: Number((veh.lat + deltaLat).toFixed(6)),
              lng: Number((veh.lng + deltaLng).toFixed(6)),
              speedKmH: newSpeed,
            };
          })
        );
      }, 2000);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;

    const query = searchQuery.toLowerCase();
    const matchedVehicle = liveVehicles.find(
      (v) => v.vehicleId.toLowerCase().includes(query) || v.driverName.toLowerCase().includes(query)
    );
    const matchedBin = bins.find((b) => b.binId.toLowerCase().includes(query) || b.locationName.toLowerCase().includes(query));
    const matchedIncident = incidents.find((i) => i.id.toLowerCase().includes(query) || i.title.toLowerCase().includes(query));

    if (matchedVehicle) {
      mapRef.current.flyTo([matchedVehicle.lat, matchedVehicle.lng], 16, { animate: true });
      setSelectedEntity({ type: 'vehicle', data: matchedVehicle });
    } else if (matchedBin) {
      mapRef.current.flyTo([matchedBin.lat, matchedBin.lng], 16, { animate: true });
      setSelectedEntity({ type: 'bin', data: matchedBin });
    } else if (matchedIncident) {
      mapRef.current.flyTo([matchedIncident.lat, matchedIncident.lng], 16, { animate: true });
      setSelectedEntity({ type: 'incident', data: matchedIncident });
    }
  };

  return (
    <div className="relative w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/95 p-3 backdrop-blur-md z-[500]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
            GIS
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              SmartWaste 360 GIS Operations Control
              {isSimulating && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse border border-emerald-500/30">
                  <Activity className="h-3 w-3" /> GPS TELEMETRY LIVE
                </span>
              )}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Visakhapatnam Municipal Zone &bull; OpenStreetMap + Leaflet Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause Telemetry
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Simulate Fleet GPS
              </>
            )}
          </button>

          <div className="flex items-center rounded-lg border border-border bg-muted p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTileStyle('dark')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                tileStyle === 'dark' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dark GIS
            </button>
            <button
              type="button"
              onClick={() => setTileStyle('light')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                tileStyle === 'light' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setTileStyle('osm')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                tileStyle === 'osm' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Standard
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex flex-col md:flex-row">
        <div className="relative flex-1">
          <div ref={mapContainerRef} className={`w-full ${height} z-0`} />

          <form
            onSubmit={handleSearch}
            className="absolute top-3 left-3 z-[400] flex items-center gap-1 rounded-lg border border-border bg-slate-900/90 p-1.5 shadow-lg backdrop-blur-md"
          >
            <Search className="h-4 w-4 text-emerald-400 ml-1.5" />
            <input
              type="text"
              placeholder="Search Vehicle, Bin #, or Incident..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-48 px-1"
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700"
            >
              Find
            </button>
          </form>

          <div className="absolute bottom-4 left-3 z-[400] flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-slate-900/90 p-2 shadow-xl backdrop-blur-md text-[11px] text-white">
            <span className="font-bold text-emerald-400 flex items-center gap-1 pr-1 border-r border-slate-700">
              <Layers className="h-3.5 w-3.5" /> Layers:
            </span>
            <label className="flex items-center gap-1 cursor-pointer hover:text-emerald-300">
              <input
                type="checkbox"
                checked={showVehicles}
                onChange={(e) => setShowVehicles(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <Truck className="h-3 w-3 text-emerald-400" /> Fleet ({liveVehicles.length})
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-amber-300">
              <input
                type="checkbox"
                checked={showBins}
                onChange={(e) => setShowBins(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <Trash2 className="h-3 w-3 text-amber-400" /> Bins ({bins.length})
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-red-300">
              <input
                type="checkbox"
                checked={showIncidents}
                onChange={(e) => setShowIncidents(e.target.checked)}
                className="accent-red-500 rounded"
              />
              <AlertTriangle className="h-3 w-3 text-red-400" /> Incidents ({incidents.length})
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-purple-300">
              <input
                type="checkbox"
                checked={showFacilities}
                onChange={(e) => setShowFacilities(e.target.checked)}
                className="accent-purple-500 rounded"
              />
              <Building2 className="h-3 w-3 text-purple-400" /> MRF Facilities
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-emerald-300">
              <input
                type="checkbox"
                checked={showWards}
                onChange={(e) => setShowWards(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <MapPin className="h-3 w-3 text-emerald-400" /> Ward Polygons
            </label>
          </div>
        </div>

        {selectedEntity && (
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-card p-4 space-y-3 z-10 transition-all shadow-inner">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-primary" /> GIS Inspection Telemetry
              </h4>
              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedEntity.type === 'vehicle' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-500" /> {selectedEntity.data.vehicleId}
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    {selectedEntity.data.status}
                  </span>
                </div>

                <div className="space-y-1.5 bg-muted p-2.5 rounded-lg font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver:</span>
                    <span className="font-semibold text-foreground">{selectedEntity.data.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vehicle Type:</span>
                    <span className="text-foreground">{selectedEntity.data.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Speed:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedEntity.data.speedKmH} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned Ward:</span>
                    <span className="text-foreground">{selectedEntity.data.ward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GPS Location:</span>
                    <span className="text-foreground">{selectedEntity.data.lat.toFixed(4)}, {selectedEntity.data.lng.toFixed(4)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Compactor Load Capacity</span>
                    <span className="font-bold text-foreground">{selectedEntity.data.capacityUsedPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedEntity.data.capacityUsedPercent >= 90
                          ? 'bg-red-500'
                          : selectedEntity.data.capacityUsedPercent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedEntity.data.capacityUsedPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Dispatching reroute signal to ${selectedEntity.data.vehicleId}`)}
                  className="w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1"
                >
                  <Navigation className="h-3.5 w-3.5" /> Re-route Vehicle
                </button>
              </div>
            )}

            {selectedEntity.type === 'bin' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Trash2 className="h-4 w-4 text-amber-500" /> Bin #{selectedEntity.data.binId}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      selectedEntity.data.fillLevelPercent >= 80
                        ? 'bg-red-500/20 text-red-600'
                        : selectedEntity.data.fillLevelPercent >= 50
                        ? 'bg-amber-500/20 text-amber-600'
                        : 'bg-emerald-500/20 text-emerald-600'
                    }`}
                  >
                    {selectedEntity.data.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">{selectedEntity.data.locationName}</p>

                <div className="space-y-1.5 bg-muted p-2.5 rounded-lg font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IoT Sensor Fill:</span>
                    <span className="font-bold text-foreground">{selectedEntity.data.fillLevelPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Internal Temp:</span>
                    <span className="text-foreground">{selectedEntity.data.tempCelsius}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Telemetry Sync:</span>
                    <span className="text-foreground">{selectedEntity.data.lastSync}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Dispatching pickup for Bin #${selectedEntity.data.binId}`)}
                  className="w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 flex items-center justify-center gap-1"
                >
                  <Truck className="h-3.5 w-3.5" /> Dispatch Immediate Pickup
                </button>
              </div>
            )}

            {selectedEntity.type === 'incident' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> {selectedEntity.data.id}
                  </span>
                  <span className="text-[10px] font-bold bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                    {selectedEntity.data.priority}
                  </span>
                </div>

                <p className="text-xs font-semibold text-foreground">{selectedEntity.data.title}</p>

                <div className="space-y-1 bg-muted p-2.5 rounded-lg text-[11px]">
                  <p><span className="text-muted-foreground">Ward:</span> {selectedEntity.data.ward}</p>
                  <p><span className="text-muted-foreground">Status:</span> {selectedEntity.data.status}</p>
                  <p><span className="text-muted-foreground">Reported:</span> {selectedEntity.data.reportedAt}</p>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Assigning crew to ${selectedEntity.data.id}`)}
                  className="w-full rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Assign Response Team
                </button>
              </div>
            )}

            {selectedEntity.type === 'ward' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-foreground text-sm">{selectedEntity.data.name}</h4>
                <div className="space-y-2 bg-muted p-2.5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cleanliness Index:</span>
                    <span className="font-bold text-base text-emerald-500">{selectedEntity.data.cleanlinessScore}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
