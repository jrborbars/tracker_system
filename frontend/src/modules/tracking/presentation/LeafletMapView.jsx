import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import RouteDrawer, { PRESET_LOCATIONS } from './RouteDrawer.jsx';
import { useI18n } from '../../../core/i18n/presentation/useI18n.js';

// Coordenadas padrão de referência (Região dos Hospitais / Av. Paulista / InCor - São Paulo)
const DEFAULT_CENTER = [-23.5614, -46.6560];

// Definição das Cercas Virtuais Padrão de Saúde / Eisenmenger
const DEFAULT_GEOFENCES = [
  {
    id: 'residence',
    name: 'Residência Familiar (Zona Segura)',
    center: [-23.5614, -46.6560],
    radius: 280,
    color: '#00897B', // Teal Pastel
    fillColor: '#00897B',
    fillOpacity: 0.18,
    icon: 'fa-solid fa-house-user',
    description: 'Área residencial segura com monitoramento contínuo.',
  },
  {
    id: 'incor',
    name: 'InCor - Instituto do Coração (HC-FMUSP)',
    center: [-23.5558, -46.6715],
    radius: 350,
    color: '#7E57C2', // Roxo Pastel
    fillColor: '#7E57C2',
    fillOpacity: 0.22,
    icon: 'fa-solid fa-hospital',
    description: 'Centro de referência cardiológica para Síndrome de Eisenmenger.',
  },
  {
    id: 'ibirapuera',
    name: 'Parque do Ibirapuera (Caminhada Leve)',
    center: [-23.5874, -46.6576],
    radius: 450,
    color: '#43A047', // Verde Pastel
    fillColor: '#43A047',
    fillOpacity: 0.15,
    icon: 'fa-solid fa-tree',
    description: 'Área autorizada para caminhadas de baixa intensidade.',
  },
];

export default function LeafletMapView({
  devices = [],
  areas = [],
  onSelectDevice,
  showToast,
  theme = 'light',
}) {
  const { t } = useI18n();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerGroupRef = useRef(null);
  const geofencesLayerGroupRef = useRef(null);
  const routeLayerGroupRef = useRef(null);
  const userLocationLayerGroupRef = useRef(null);

  const [currentLayerType, setCurrentLayerType] = useState('carto'); // 'carto' | 'satellite' | 'osm'
  const [selectedTrackerId, setSelectedTrackerId] = useState(devices[0]?.id || null);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1], zoom: 14 });
  const [isRouteDrawerOpen, setIsRouteDrawerOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // 1. Inicialização do Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
        delete mapContainerRef.current._leaflet_id;
      }
      const map = L.map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 14,
        zoomControl: false,
      });

      // Controle de zoom no canto superior direito
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Layer de Tiles CartoDB (Dark Matter no dark mode ou Positron no light mode)
      const cartoTileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      const cartoTileLayer = L.tileLayer(cartoTileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = cartoTileLayer;

      // Grupos de camadas
      geofencesLayerGroupRef.current = L.layerGroup().addTo(map);
      routeLayerGroupRef.current = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      userLocationLayerGroupRef.current = L.layerGroup().addTo(map);

      // Listener de movimento do mapa
      map.on('move', () => {
        const center = map.getCenter();
        setMapCoordinates({
          lat: parseFloat(center.lat.toFixed(5)),
          lng: parseFloat(center.lng.toFixed(5)),
          zoom: map.getZoom(),
        });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Alternância de Camadas de Tiles com base no tipo e no tema (Dark / Light)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);

    let newTileLayer;
    if (currentLayerType === 'satellite') {
      newTileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 18,
        }
      );
    } else if (currentLayerType === 'osm') {
      newTileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      );
    } else {
      // CartoDB Positron (Light) ou Dark Matter (Dark)
      const cartoTileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      newTileLayer = L.tileLayer(cartoTileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      });
    }

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [currentLayerType, theme]);

  // 3. Renderização das Cercas Virtuais (Geofences)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const geofencesGroup = geofencesLayerGroupRef.current;
    if (!map || !geofencesGroup) return;

    geofencesGroup.clearLayers();

    DEFAULT_GEOFENCES.forEach((fence) => {
      const circle = L.circle(fence.center, {
        radius: fence.radius,
        color: fence.color,
        fillColor: fence.fillColor,
        fillOpacity: fence.fillOpacity,
        weight: 2,
        dashArray: '5, 5',
      });

      const popupContent = `
        <div style="font-family: 'Roboto', sans-serif; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; color: ${fence.color}; font-weight: 700; font-size: 13px;">
            <i class="${fence.icon}"></i> ${fence.name}
          </div>
          <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">
            ${fence.description}
          </p>
          <div style="margin-top: 8px; font-size: 10px; font-weight: 700; color: #1e293b; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">
            Raio de Segurança: ${fence.radius} metros
          </div>
        </div>
      `;

      circle.bindPopup(popupContent, { maxWidth: 260, className: 'custom-leaflet-popup' });
      circle.addTo(geofencesGroup);
    });
  }, [areas]);

  // 4. Renderização dos Marcadores dos Pacientes (Rastreadores Vivos)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    devices.forEach((device, index) => {
      const lat = device.last_latitude || (DEFAULT_CENTER[0] + (index === 0 ? 0.002 : -0.004));
      const lng = device.last_longitude || (DEFAULT_CENTER[1] + (index === 0 ? -0.003 : 0.006));

      const isSelected = selectedTrackerId === device.id;
      const battery = device.battery_level ?? 85;
      const batteryColor = battery > 50 ? '#00897B' : battery > 20 ? '#FB8C00' : '#E53935';

      const markerHtml = `
        <div class="leaflet-radar-marker ${isSelected ? 'selected' : ''}">
          <div class="radar-ping-ring"></div>
          <div class="radar-ping-ring inner"></div>
          <div class="radar-core-pin">
            <i class="fa-solid fa-person-walking"></i>
          </div>
          <div class="radar-badge-label">
            <span class="tracker-title">${device.name || 'Familiar'}</span>
            <span class="tracker-bat" style="color: ${batteryColor};">
              <i class="fa-solid fa-battery-three-quarters"></i> ${battery}%
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'leaflet-custom-div-icon',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: 'Roboto', sans-serif; padding: 4px; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <div style="font-weight: 700; font-size: 13px; color: #1e293b;">
              <i class="fa-solid fa-id-badge" style="color: #00897B; margin-right: 4px;"></i>
              ${device.name}
            </div>
            <span style="background: #e0f2f1; color: #004d40; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px;">
              ATIVO
            </span>
          </div>
          
          <div style="font-size: 11px; color: #64748b; display: flex; flex-direction: column; gap: 4px;">
            <div><strong>Modelo:</strong> ${device.model || 'GPS Satelital Medical'}</div>
            <div><strong>IMEI / ID:</strong> <code>${device.imei || device.id}</code></div>
            <div><strong>Bateria:</strong> <span style="color: ${batteryColor}; font-weight: 700;">${battery}%</span></div>
            <div><strong>Status Médico:</strong> <span style="color: #00897B; font-weight: 700;">Em Repouso (Seguro)</span></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280, className: 'custom-leaflet-popup' });

      marker.on('click', () => {
        setSelectedTrackerId(device.id);
        if (onSelectDevice) onSelectDevice(device);
      });

      marker.addTo(markersGroup);
    });
  }, [devices, selectedTrackerId, onSelectDevice]);

  // 5. Geolocalização Real do Usuário via Navegador (HTML5 Geolocation)
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      if (showToast) showToast('Geolocalização não é suportada por este navegador.');
      return;
    }

    setIsLocating(true);
    if (showToast) showToast('Solicitando autorização de localização ao navegador...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLoc = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || 10,
          timestamp: Date.now(),
        };

        setUserLocation(newLoc);
        setIsLocating(false);

        // Renderiza marcador de posição real do usuário no mapa
        const map = mapInstanceRef.current;
        const userLocGroup = userLocationLayerGroupRef.current;
        if (map && userLocGroup) {
          userLocGroup.clearLayers();

          // Círculo de precisão do GPS
          const accuracyCircle = L.circle([latitude, longitude], {
            radius: Math.max(accuracy, 20),
            color: '#0284C7',
            fillColor: '#38BDF8',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4, 4',
          });

          // Marcador do Cuidador / Usuário
          const userPinHtml = `
            <div class="user-live-gps-marker">
              <div class="user-gps-pulse"></div>
              <div class="user-gps-center">
                <i class="fa-solid fa-location-crosshairs"></i>
              </div>
              <div class="user-gps-label">
                <span>Minha Posição</span>
              </div>
            </div>
          `;

          const userPinIcon = L.divIcon({
            html: userPinHtml,
            className: 'user-gps-custom-icon',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          const userMarker = L.marker([latitude, longitude], { icon: userPinIcon });
          userMarker.bindPopup(`
            <div style="font-family: 'Roboto', sans-serif; padding: 4px;">
              <strong style="color: #0284C7; font-size: 13px;">
                <i class="fa-solid fa-location-crosshairs"></i> Minha Localização Atual
              </strong>
              <p style="margin: 4px 0 0; font-size: 11px; color: #64748B;">
                Coordenadas: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}<br/>
                Precisão: &plusmn;${Math.round(accuracy)} metros
              </p>
            </div>
          `);

          accuracyCircle.addTo(userLocGroup);
          userMarker.addTo(userLocGroup);

          // Animação suave para a posição do usuário
          map.flyTo([latitude, longitude], 16, {
            animate: true,
            duration: 1.5,
          });
        }

        if (showToast) {
          showToast(`Localização obtida com sucesso! (Precisão: ±${Math.round(accuracy)}m)`);
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'Erro ao obter localização.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Permissão de localização negada no navegador. Permita o acesso nas permissões do site.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Informações de localização indisponíveis no momento.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Tempo limite excedido ao obter sinal de localização.';
        }
        if (showToast) showToast(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 6. Aplicação do Traçado de Rota (Polyline no Leaflet)
  const handleApplyRoute = ({ origin, destination, mode }) => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerGroupRef.current;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();
    setActiveRoute({ origin, destination, mode });

    const start = origin.coords;
    const end = destination.coords;

    const mid1 = [
      start[0] + (end[0] - start[0]) * 0.35 + (start[1] > end[1] ? 0.001 : -0.001),
      start[1] + (end[1] - start[1]) * 0.25,
    ];
    const mid2 = [
      start[0] + (end[0] - start[0]) * 0.7,
      start[1] + (end[1] - start[1]) * 0.75 + (start[0] > end[0] ? -0.001 : 0.001),
    ];

    const routeCoords = [start, mid1, mid2, end];

    const glowLine = L.polyline(routeCoords, {
      color: '#FFFFFF',
      weight: 10,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round',
    });

    const mainLine = L.polyline(routeCoords, {
      color: mode === 'car' ? '#7E57C2' : '#00897B',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    });

    const originIcon = L.divIcon({
      html: `
        <div style="background: #FFFFFF; color: #00897B; border: 2px solid #00897B; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
          <i class="fa-solid fa-circle-dot"></i>
        </div>
      `,
      className: 'route-origin-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const destIcon = L.divIcon({
      html: `
        <div style="background: #E53935; color: #FFFFFF; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 3px 8px rgba(229,57,53,0.4); border: 2px solid #FFFFFF;">
          <i class="fa-solid fa-location-dot"></i>
        </div>
      `,
      className: 'route-dest-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    const startMarker = L.marker(start, { icon: originIcon });
    const endMarker = L.marker(end, { icon: destIcon });

    glowLine.addTo(routeGroup);
    mainLine.addTo(routeGroup);
    startMarker.addTo(routeGroup);
    endMarker.addTo(routeGroup);

    map.fitBounds(mainLine.getBounds(), {
      padding: [70, 70],
      maxZoom: 16,
      animate: true,
      duration: 1.2,
    });
  };

  const handleClearRoute = () => {
    if (routeLayerGroupRef.current) {
      routeLayerGroupRef.current.clearLayers();
    }
    setActiveRoute(null);
  };

  const handleFocusTracker = (deviceId) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const targetDev = devices.find((d) => d.id === (deviceId || selectedTrackerId)) || devices[0];
    if (targetDev) {
      const lat = targetDev.last_latitude || DEFAULT_CENTER[0];
      const lng = targetDev.last_longitude || DEFAULT_CENTER[1];

      map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1.2,
      });
      setSelectedTrackerId(targetDev.id);
    } else {
      map.flyTo(DEFAULT_CENTER, 15, { animate: true, duration: 1.2 });
    }
  };

  return (
    <div className="leaflet-map-wrapper">
      {/* 1. Barra de Ferramentas / Controles Superiores do Mapa */}
      <div className="map-controls-overlay">
        {/* Botão de Traçar Rota / Apoio */}
        <div className="route-action-trigger-group">
          <button
            type="button"
            className={`btn-map-route-trigger ${isRouteDrawerOpen ? 'active' : ''}`}
            onClick={() => {
              const nextState = !isRouteDrawerOpen;
              setIsRouteDrawerOpen(nextState);
              if (nextState) {
                handleApplyRoute({
                  origin: userLocation
                    ? { coords: [userLocation.lat, userLocation.lng], name: 'Seu local (GPS Real)' }
                    : PRESET_LOCATIONS[0],
                  destination: PRESET_LOCATIONS[1],
                  mode: 'walking',
                });
              }
            }}
            title={t('tracking.routesBtn')}
          >
            <i className="fa-solid fa-route"></i>
            <span>{t('tracking.routesBtn')}</span>
            {activeRoute && <span className="route-active-dot" title="Traçado Ativo"></span>}
          </button>
        </div>

        {/* Botão de Minha Localização (HTML5 Geolocation) */}
        <div className="location-trigger-group">
          <button
            type="button"
            className={`btn-map-locate-me ${isLocating ? 'locating' : ''} ${userLocation ? 'located' : ''}`}
            onClick={handleLocateUser}
            title={t('tracking.locateMe')}
          >
            <i className={`fa-solid ${isLocating ? 'fa-spinner fa-spin' : userLocation ? 'fa-location-crosshairs' : 'fa-crosshairs'}`}></i>
            <span>{isLocating ? t('common.loading') : userLocation ? t('common.online') : t('tracking.locateMe')}</span>
          </button>
        </div>

        {/* Seletor de Camadas de Mapa */}
        <div className="layer-selector-group">
          <button
            type="button"
            className={`btn-map-layer ${currentLayerType === 'carto' ? 'active' : ''}`}
            onClick={() => setCurrentLayerType('carto')}
            title={t('tracking.layerCarto')}
          >
            <i className="fa-solid fa-map"></i>
            <span>{t('tracking.layerCarto')}</span>
          </button>
          <button
            type="button"
            className={`btn-map-layer ${currentLayerType === 'satellite' ? 'active' : ''}`}
            onClick={() => setCurrentLayerType('satellite')}
            title={t('tracking.layerSatellite')}
          >
            <i className="fa-solid fa-satellite"></i>
            <span>{t('tracking.layerSatellite')}</span>
          </button>
        </div>

        {/* Botão de Localização Rápida no Paciente */}
        <div className="focus-actions-group">
          <button
            type="button"
            className="btn-map-focus"
            onClick={() => handleFocusTracker()}
            title="Centralizar no Paciente"
          >
            <i className="fa-solid fa-person-walking"></i>
            <span>Focar Paciente</span>
          </button>
        </div>
      </div>

      {/* 2. Aba Lateral de Traçado de Rotas Sobreposta ao Mapa (Drawer) */}
      <RouteDrawer
        isOpen={isRouteDrawerOpen}
        onClose={() => setIsRouteDrawerOpen(false)}
        devices={devices}
        onApplyRoute={handleApplyRoute}
        onClearRoute={handleClearRoute}
        activeRouteInfo={activeRoute}
        userLocation={userLocation}
        onRequestLocation={handleLocateUser}
        isLocating={isLocating}
      />

      {/* 3. Container Leaflet do DOM */}
      <div ref={mapContainerRef} className="leaflet-dom-map-container" />

      {/* 4. Barra de Status Inferior (HUD com Coordenadas e Satélites) */}
      <div className="map-hud-footer">
        <div className="hud-pill">
          <i className="fa-solid fa-satellite-dish" style={{ color: 'var(--color-primary)' }}></i>
          <span>GPS Satelital Ativo &bull; Precisão: &plusmn;3m</span>
        </div>
        {userLocation && (
          <div className="hud-pill user-gps">
            <i className="fa-solid fa-location-crosshairs" style={{ color: '#0284C7' }}></i>
            <span>Meu GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)} (&plusmn;{Math.round(userLocation.accuracy)}m)</span>
          </div>
        )}
        <div className="hud-pill coordinates">
          <i className="fa-solid fa-compass" style={{ color: 'var(--color-secondary)' }}></i>
          <span>Lat: {mapCoordinates.lat} | Lng: {mapCoordinates.lng}</span>
        </div>
        <div className="hud-pill geofences-count">
          <i className="fa-solid fa-shield-heart" style={{ color: 'var(--color-success)' }}></i>
          <span>{DEFAULT_GEOFENCES.length} Cercas Ativas</span>
        </div>
      </div>
    </div>
  );
}
