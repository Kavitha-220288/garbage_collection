'use client';

import dynamic from 'next/dynamic';

export const LeafletMapPicker = dynamic(
  () => import('./leaflet-map-picker').then((mod) => mod.LeafletMapPicker),
  { ssr: false }
);

export const LeafletGisMap = dynamic(
  () => import('./leaflet-gis-map').then((mod) => mod.LeafletGisMap),
  { ssr: false }
);
