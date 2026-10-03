import type LType from 'leaflet';

export function createVehicleIcon(L: typeof LType, status: string, vehicleType: string = 'Compactor') {
  let bgColor = '#10b981'; // Green for On Route / Available
  if (status === 'COLLECTING') bgColor = '#3b82f6'; // Blue
  if (status === 'DELAYED' || status === 'FULL') bgColor = '#eab308'; // Amber
  if (status === 'OFFLINE' || status === 'MAINTENANCE') bgColor = '#ef4444'; // Red

  const svgHtml = `
    <div style="
      background-color: ${bgColor};
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35), 0 0 0 3px rgba(255,255,255,0.9);
      transition: transform 0.2s ease;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-4v10Z"/>
        <circle cx="7" cy="18" r="2"/>
        <circle cx="17" cy="18" r="2"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-vehicle-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

export function createBinIcon(L: typeof LType, fillLevel: number) {
  let color = '#10b981'; // < 50%
  if (fillLevel >= 50 && fillLevel < 80) color = '#f59e0b'; // 50-80%
  if (fillLevel >= 80) color = '#ef4444'; // > 80%

  const svgHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.9);
      font-weight: bold;
      font-size: 11px;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-bin-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

export function createIncidentIcon(L: typeof LType, priority: string) {
  let color = '#ef4444'; // CRITICAL
  if (priority === 'HIGH') color = '#f97316';
  if (priority === 'MEDIUM') color = '#eab308';
  if (priority === 'LOW') color = '#3b82f6';

  const svgHtml = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(239,68,68,0.4), 0 0 0 3px rgba(255,255,255,0.9);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-incident-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

export function createFacilityIcon(L: typeof LType, type: string = 'MRF') {
  const color = '#8b5cf6'; // Purple for MRF / Processing
  const svgHtml = `
    <div style="
      background-color: ${color};
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(139,92,246,0.4), 0 0 0 2px rgba(255,255,255,0.9);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-facility-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

export function createPinPickerIcon(L: typeof LType) {
  const svgHtml = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0px 6px 10px rgba(0,0,0,0.4));
    ">
      <div style="
        background: linear-gradient(135deg, #0b3b2f 0%, #10b981 100%);
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid #ffffff;
      ">
        <div style="
          width: 14px;
          height: 14px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-pin-picker-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
}
