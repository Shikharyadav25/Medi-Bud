"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Search, Hospital, Pill, Stethoscope, X, ExternalLink, Loader2, AlertCircle } from "lucide-react";

type PlaceType = "hospital" | "clinic" | "pharmacy" | "doctor";

const PLACE_TYPES: { key: PlaceType; label: string; icon: React.ReactNode; query: string; color: string }[] = [
  { key: "hospital", label: "Hospitals", icon: <Hospital size={15} />, query: "hospital", color: "#f87171" },
  { key: "clinic",   label: "Clinics",   icon: <Stethoscope size={15} />, query: "clinic medical centre", color: "#a78bfa" },
  { key: "pharmacy", label: "Pharmacy",  icon: <Pill size={15} />, query: "pharmacy chemist medical store", color: "#4ade80" },
  { key: "doctor",   label: "Doctors",   icon: <MapPin size={15} />, query: "doctor general practitioner", color: "#60a5fa" },
];

export default function NearbyPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  const [status, setStatus] = useState<"idle" | "locating" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeType, setActiveType] = useState<PlaceType>("hospital");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");

  // ── Initialise Leaflet map ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = async () => {
      if ((window as any).L) return initMap();
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || leafletMap.current) return;
      const L = (window as any).L;

      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629], // India centre
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayer.current = L.layerGroup().addTo(map);
      leafletMap.current = map;
    };

    loadLeaflet();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // ── Locate user ───────────────────────────────────────────────────────────
  const locateUser = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setStatus("error");
      return;
    }
    setStatus("locating");
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        if (leafletMap.current) {
          const L = (window as any).L;
          leafletMap.current.setView([lat, lng], 14);
          // User location marker
          L.circle([lat, lng], {
            color: "#7c3aed", fillColor: "#7c3aed", fillOpacity: 0.25, radius: 150,
          }).addTo(markersLayer.current);
          L.marker([lat, lng], {
            icon: L.divIcon({
              html: `<div style="width:14px;height:14px;background:#7c3aed;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(124,58,237,0.8)"></div>`,
              iconSize: [14, 14], iconAnchor: [7, 7], className: "",
            }),
          }).addTo(markersLayer.current).bindPopup("<b>You are here</b>");
        }
        fetchNearby(lat, lng, activeType);
      },
      (err) => {
        setError("Could not get your location. Please allow location access and try again.");
        setStatus("error");
      },
      { timeout: 10000 }
    );
  };

  // ── Fetch nearby via Overpass API (free, no key) ──────────────────────────
  const fetchNearby = async (lat: number, lng: number, type: PlaceType) => {
    setStatus("loading");
    setResults([]);
    setSelected(null);

    const cfg = PLACE_TYPES.find(p => p.key === type)!;
    const radius = 10000; // 10 km

    let overpassSubQuery = "";
    if (type === "hospital") {
      overpassSubQuery = `
        nwr["amenity"="hospital"](around:${radius},${lat},${lng});
        nwr["healthcare"="hospital"](around:${radius},${lat},${lng});
      `;
    } else if (type === "clinic") {
      overpassSubQuery = `
        nwr["amenity"="clinic"](around:${radius},${lat},${lng});
        nwr["amenity"="medical_centre"](around:${radius},${lat},${lng});
        nwr["healthcare"="clinic"](around:${radius},${lat},${lng});
        nwr["healthcare"="centre"](around:${radius},${lat},${lng});
      `;
    } else if (type === "pharmacy") {
      overpassSubQuery = `
        nwr["amenity"="pharmacy"](around:${radius},${lat},${lng});
        nwr["shop"="chemist"](around:${radius},${lat},${lng});
        nwr["shop"="pharmacy"](around:${radius},${lat},${lng});
        nwr["shop"="medical"](around:${radius},${lat},${lng});
      `;
    } else if (type === "doctor") {
      overpassSubQuery = `
        nwr["amenity"="doctors"](around:${radius},${lat},${lng});
        nwr["healthcare"="doctor"](around:${radius},${lat},${lng});
      `;
    }

    const query = `
      [out:json][timeout:25];
      (
        ${overpassSubQuery}
      );
      out body center 30;
    `;

    // Fallback simpler query if complex one fails
    const simpleQuery = `
      [out:json][timeout:25];
      nwr["amenity"~"hospital|clinic|pharmacy|doctors|medical_centre"](around:${radius},${lat},${lng});
      out center 30;
    `;

    try {
      let data: any = null;

      // Try primary query
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(query),
      });

      if (res.ok) {
        data = await res.json();
      }

      // If no results, try simpler query
      if (!data || !data.elements || data.elements.length === 0) {
        const res2 = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: "data=" + encodeURIComponent(simpleQuery),
        });
        if (res2.ok) data = await res2.json();
      }

      const elements = (data?.elements || []).map((el: any) => {
        const clat = el.lat ?? el.center?.lat;
        const clng = el.lon ?? el.center?.lon;
        return {
          id: el.id,
          name: el.tags?.name || el.tags?.["name:en"] || "Unnamed Facility",
          lat: clat,
          lng: clng,
          phone: el.tags?.phone || el.tags?.["contact:phone"] || null,
          website: el.tags?.website || el.tags?.["contact:website"] || null,
          addr: [
            el.tags?.["addr:housenumber"],
            el.tags?.["addr:street"],
            el.tags?.["addr:city"],
          ].filter(Boolean).join(", ") || null,
          type: el.tags?.amenity || el.tags?.healthcare || type,
          opening: el.tags?.opening_hours || null,
        };
      }).filter((e: any) => e.lat && e.lng);

      // Place markers
      if (leafletMap.current) {
        const L = (window as any).L;
        // clear old markers except user location
        markersLayer.current.clearLayers();

        // Re-add user marker
        L.circle([lat, lng], {
          color: "#7c3aed", fillColor: "#7c3aed", fillOpacity: 0.25, radius: 150,
        }).addTo(markersLayer.current);
        L.marker([lat, lng], {
          icon: L.divIcon({
            html: `<div style="width:14px;height:14px;background:#7c3aed;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(124,58,237,0.8)"></div>`,
            iconSize: [14, 14], iconAnchor: [7, 7], className: "",
          }),
        }).addTo(markersLayer.current).bindPopup("<b>You are here</b>");

        elements.forEach((el: any, i: number) => {
          const marker = L.marker([el.lat, el.lng], {
            icon: L.divIcon({
              html: `<div style="background:${cfg.color};width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
                <div style="transform:rotate(45deg);color:#fff;font-size:10px;font-weight:800">${i + 1}</div>
              </div>`,
              iconSize: [26, 26], iconAnchor: [13, 26], className: "",
            }),
          }).addTo(markersLayer.current);
          marker.on("click", () => setSelected(el));
          marker.bindTooltip(el.name, { direction: "top", offset: [0, -28] });
        });
      }

      setResults(elements);
      setStatus("done");
    } catch (e) {
      setError("Failed to fetch nearby places. Please try again.");
      setStatus("error");
    }
  };

  const handleTypeChange = (type: PlaceType) => {
    setActiveType(type);
    if (coords) fetchNearby(coords.lat, coords.lng, type);
  };

  const flyTo = (el: any) => {
    setSelected(el);
    if (leafletMap.current) {
      leafletMap.current.flyTo([el.lat, el.lng], 17, { duration: 1 });
    }
  };

  const filtered = results.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const distKm = (lat: number, lng: number) => {
    if (!coords) return null;
    const R = 6371;
    const dLat = (lat - coords.lat) * Math.PI / 180;
    const dLng = (lng - coords.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(coords.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .nearby-root {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #070712;
          font-family: 'Sora', sans-serif;
          color: rgba(255,255,255,0.88);
          padding-top: 72px;
          overflow: hidden;
        }

        /* ── TOP CONTROLS BAR ── */
        .nearby-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: rgba(7,7,18,0.95);
          border-bottom: 1px solid rgba(124,58,237,0.1);
          flex-shrink: 0;
          flex-wrap: wrap;
          backdrop-filter: blur(12px);
        }
        .nearby-bar-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1rem;
          color: #fff;
          flex-shrink: 0;
          margin-right: 4px;
        }

        .type-tabs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .type-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 13px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.45);
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
        }
        .type-tab:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.75); }
        .type-tab.active-hospital { background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.35); color: #f87171; }
        .type-tab.active-clinic { background: rgba(167,139,250,0.15); border-color: rgba(167,139,250,0.35); color: #a78bfa; }
        .type-tab.active-pharmacy { background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.35); color: #4ade80; }
        .type-tab.active-doctor { background: rgba(96,165,250,0.15); border-color: rgba(96,165,250,0.35); color: #60a5fa; }

        .locate-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
          box-shadow: 0 4px 14px rgba(124,58,237,0.3);
          white-space: nowrap;
          margin-left: auto;
        }
        .locate-btn:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(124,58,237,0.5); transform: translateY(-1px); }
        .locate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── MAIN LAYOUT ── */
        .nearby-body {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* ── RESULTS SIDEBAR ── */
        .results-panel {
          width: 320px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #0d0c1e 0%, #08070f 100%);
          border-right: 1px solid rgba(124,58,237,0.1);
          overflow: hidden;
        }
        .results-search {
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }
        .search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 7px 12px;
        }
        .search-wrap input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 0.8rem;
        }
        .search-wrap input::placeholder { color: rgba(255,255,255,0.25); }

        .results-count {
          padding: 8px 14px 4px;
          font-size: 0.62rem;
          color: rgba(255,255,255,0.25);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .results-list {
          flex: 1;
          overflow-y: auto;
          padding: 6px 10px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .results-list::-webkit-scrollbar { width: 2px; }
        .results-list::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 2px; }

        .result-card {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          cursor: pointer;
          transition: all 0.18s;
        }
        .result-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(124,58,237,0.2); }
        .result-card.active { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.3); }
        .result-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px; height: 20px;
          border-radius: 50%;
          font-size: 0.62rem;
          font-weight: 700;
          margin-bottom: 6px;
          color: #fff;
          flex-shrink: 0;
        }
        .result-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          line-height: 1.35;
          margin-bottom: 5px;
        }
        .result-meta {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.35);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .result-dist {
          font-size: 0.68rem;
          font-weight: 600;
          color: #a78bfa;
          margin-top: 4px;
        }
        .result-actions {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }
        .result-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.55);
          font-size: 0.68rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
          font-family: 'Sora', sans-serif;
        }
        .result-btn:hover { background: rgba(124,58,237,0.15); color: #c4b5fd; border-color: rgba(124,58,237,0.3); }

        /* ── MAP ── */
        .map-wrap {
          flex: 1;
          position: relative;
          min-width: 0;
        }
        #leaflet-map {
          width: 100%;
          height: 100%;
        }

        /* Map overlay messages */
        .map-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(7,7,18,0.85);
          backdrop-filter: blur(8px);
          z-index: 500;
          gap: 14px;
          padding: 32px;
          text-align: center;
        }
        .map-overlay-icon {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.15));
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
        }
        .map-overlay h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.3rem;
          color: #fff;
        }
        .map-overlay p {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.38);
          max-width: 280px;
          line-height: 1.65;
        }
        .map-overlay-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
          box-shadow: 0 6px 20px rgba(124,58,237,0.4);
          margin-top: 4px;
        }
        .map-overlay-btn:hover { box-shadow: 0 8px 28px rgba(124,58,237,0.6); transform: translateY(-1px); }
        .map-overlay-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }

        /* Leaflet popups */
        .leaflet-popup-content-wrapper {
          background: #13121f !important;
          border: 1px solid rgba(124,58,237,0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
          color: #fff !important;
        }
        .leaflet-popup-tip { background: #13121f !important; }
        .leaflet-popup-content { margin: 10px 14px !important; font-family: 'Sora', sans-serif !important; font-size: 0.78rem !important; color: rgba(255,255,255,0.8) !important; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .nearby-root { padding-top: 52px; }
          .nearby-body { flex-direction: column-reverse; }
          .results-panel { width: 100%; height: 42vh; border-right: none; border-top: 1px solid rgba(124,58,237,0.1); }
          .map-wrap { flex: 1; min-height: 40vh; }
          .nearby-bar { padding: 8px 12px; gap: 6px; }
          .type-tab { padding: 5px 10px; font-size: 0.7rem; }
          .locate-btn { padding: 6px 12px; font-size: 0.72rem; }
        }
      `}</style>

      <div className="nearby-root">

        {/* ── TOP BAR ── */}
        <div className="nearby-bar">
          <span className="nearby-bar-title">Find Nearby Care</span>
          <div className="type-tabs">
            {PLACE_TYPES.map(t => (
              <button
                key={t.key}
                className={`type-tab ${activeType === t.key ? `active-${t.key}` : ""}`}
                onClick={() => handleTypeChange(t.key)}
                disabled={status === "locating" || status === "loading"}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <button
            className="locate-btn"
            onClick={locateUser}
            disabled={status === "locating" || status === "loading"}
          >
            {status === "locating" || status === "loading"
              ? <><Loader2 size={14} className="spin" /> Locating…</>
              : <><Navigation size={14} /> Use My Location</>}
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="nearby-body">

          {/* Results panel */}
          <aside className="results-panel">
            {status === "done" && (
              <div className="results-search">
                <div className="search-wrap">
                  <Search size={13} color="rgba(255,255,255,0.3)" />
                  <input
                    placeholder="Search results…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {status === "done" && (
              <div className="results-count">
                {filtered.length} place{filtered.length !== 1 ? "s" : ""} found within 10 km
              </div>
            )}

            <div className="results-list">
              {status === "done" && filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "rgba(255,255,255,0.25)", fontSize: "0.78rem" }}>
                  No results found. Try a different type.
                </div>
              )}

              {filtered.map((el, i) => {
                const cfg = PLACE_TYPES.find(p => p.key === activeType)!;
                const dist = distKm(el.lat, el.lng);
                return (
                  <div
                    key={el.id}
                    className={`result-card ${selected?.id === el.id ? "active" : ""}`}
                    onClick={() => flyTo(el)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span className="result-num" style={{ background: cfg.color }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="result-name">{el.name}</div>
                        {el.addr && <div className="result-meta"><MapPin size={10} /> {el.addr}</div>}
                        {dist && <div className="result-dist">{dist} km away</div>}
                      </div>
                    </div>
                    <div className="result-actions">
                      <a
                        className="result-btn"
                        href={`https://www.openstreetmap.org/directions?from=&to=${el.lat},${el.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                      >
                        <Navigation size={10} /> Directions
                      </a>
                      {el.website && (
                        <a
                          className="result-btn"
                          href={el.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink size={10} /> Website
                        </a>
                      )}
                      {el.phone && (
                        <a
                          className="result-btn"
                          href={`tel:${el.phone}`}
                          onClick={e => e.stopPropagation()}
                        >
                          📞 Call
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Map */}
          <div className="map-wrap">
            <div id="leaflet-map" ref={mapRef} />

            {/* Idle overlay */}
            {status === "idle" && (
              <div className="map-overlay">
                <div className="map-overlay-icon">
                  <MapPin size={28} color="#a78bfa" />
                </div>
                <h2>Find Healthcare Near You</h2>
                <p>Share your location to discover hospitals, clinics, pharmacies and doctors within 10 km using free OpenStreetMap data.</p>
                <button className="map-overlay-btn" onClick={locateUser}>
                  <Navigation size={16} /> Share My Location
                </button>
              </div>
            )}

            {/* Locating overlay */}
            {status === "locating" && (
              <div className="map-overlay">
                <Loader2 size={32} color="#a78bfa" className="spin" />
                <h2>Getting your location…</h2>
                <p>Please allow location access in your browser when prompted.</p>
              </div>
            )}

            {/* Loading overlay */}
            {status === "loading" && (
              <div className="map-overlay">
                <Loader2 size={32} color="#a78bfa" className="spin" />
                <h2>Fetching nearby places…</h2>
                <p>Searching OpenStreetMap database within 10 km of your location.</p>
              </div>
            )}

            {/* Error overlay */}
            {status === "error" && (
              <div className="map-overlay">
                <div className="map-overlay-icon" style={{ borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)" }}>
                  <AlertCircle size={28} color="#f87171" />
                </div>
                <h2 style={{ color: "#f87171" }}>Location Error</h2>
                <p>{error}</p>
                <button className="map-overlay-btn" style={{ background: "rgba(248,113,113,0.2)", border: "1px solid rgba(248,113,113,0.4)", boxShadow: "none" }} onClick={locateUser}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
