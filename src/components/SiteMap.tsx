'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { QcInspection, SafetyIncident } from '@/types';

export default function SiteMap({
  inspections,
  incidents,
}: {
  inspections: QcInspection[];
  incidents: SafetyIncident[];
}) {
  const qcPoints = inspections.filter((q) => q.latitude && q.longitude);
  const incidentPoints = incidents.filter((i) => i.latitude && i.longitude);
  const allPoints = [
    ...qcPoints.map((q) => [q.latitude!, q.longitude!] as [number, number]),
    ...incidentPoints.map((i) => [i.latitude!, i.longitude!] as [number, number]),
  ];

  if (allPoints.length === 0) {
    return (
      <p className="text-sm text-[var(--color-paper-dim)] py-6 text-center border border-dashed border-[var(--color-border)] rounded-md">
        No geotagged photos yet. Location is captured automatically when a photo is
        attached to a QC inspection or incident report.
      </p>
    );
  }

  const center: [number, number] = [
    allPoints.reduce((s, p) => s + p[0], 0) / allPoints.length,
    allPoints.reduce((s, p) => s + p[1], 0) / allPoints.length,
  ];

  return (
    <div className="rounded-md border border-[var(--color-border)] overflow-hidden" style={{ height: 360 }}>
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        {qcPoints.map((q) => (
          <CircleMarker
            key={q.id}
            center={[q.latitude!, q.longitude!]}
            radius={7}
            pathOptions={{
              color: q.result === 'fail' ? '#E06B5E' : '#2E8FFF',
              fillColor: q.result === 'fail' ? '#E06B5E' : '#2E8FFF',
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <strong>{q.title}</strong>
              <br />
              QC · {q.result === 'na' ? 'N/A' : q.result} · {new Date(q.inspected_at).toLocaleDateString()}
              {q.photo_url && (
                <>
                  <br />
                  <img src={q.photo_url} alt="" style={{ width: 120, marginTop: 4, borderRadius: 4 }} />
                </>
              )}
            </Popup>
          </CircleMarker>
        ))}
        {incidentPoints.map((i) => (
          <CircleMarker
            key={i.id}
            center={[i.latitude!, i.longitude!]}
            radius={8}
            pathOptions={{
              color: '#C4453A',
              fillColor: '#C4453A',
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <strong>{i.title}</strong>
              <br />
              {i.severity} · {new Date(i.occurred_at).toLocaleDateString()}
              {i.photo_url && (
                <>
                  <br />
                  <img src={i.photo_url} alt="" style={{ width: 120, marginTop: 4, borderRadius: 4 }} />
                </>
              )}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
