import React, { useState } from 'react';

// Locais pré-configurados de apoio e referências médicas
export const PRESET_LOCATIONS = [
  {
    id: 'current_location',
    name: 'Seu local (Minha Posição Atual)',
    type: 'user',
    coords: [-23.5680, -46.6500],
    icon: 'fa-solid fa-location-crosshairs',
    badge: 'Cuidador',
  },
  {
    id: 'patient_live',
    name: 'Paciente (Rastreador GPS ao Vivo)',
    type: 'patient',
    coords: [-23.5594, -46.6590],
    icon: 'fa-solid fa-person-walking',
    badge: 'Alvo',
  },
  {
    id: 'incor',
    name: 'InCor - Instituto do Coração (HC-FMUSP)',
    type: 'hospital',
    coords: [-23.5558, -46.6715],
    icon: 'fa-solid fa-hospital',
    badge: 'Emergência Cardiológica',
  },
  {
    id: 'residence',
    name: 'Residência Familiar (Zona Segura)',
    type: 'home',
    coords: [-23.5614, -46.6560],
    icon: 'fa-solid fa-house-chimney-medical',
    badge: 'Residência',
  },
  {
    id: 'samaritano',
    name: 'Hospital Samaritano / Pronto-Socorro',
    type: 'hospital',
    coords: [-23.5385, -46.6582],
    icon: 'fa-solid fa-truck-medical',
    badge: 'Pronto Atendimento',
  },
  {
    id: 'ibirapuera',
    name: 'Parque do Ibirapuera (Portão 7)',
    type: 'park',
    coords: [-23.5874, -46.6576],
    icon: 'fa-solid fa-tree',
    badge: 'Lazer',
  },
];

export default function RouteDrawer({
  isOpen,
  onClose,
  devices = [],
  onApplyRoute,
  onClearRoute,
  activeRouteInfo,
  userLocation = null,
  onRequestLocation,
  isLocating = false,
}) {
  const [travelMode, setTravelMode] = useState('walking'); // 'car' | 'motorcycle' | 'transit' | 'walking' | 'bicycling'
  const [originId, setOriginId] = useState('current_location');
  const [destinationId, setDestinationId] = useState('patient_live');
  const [searchOriginText, setSearchOriginText] = useState('');
  const [searchDestText, setSearchDestText] = useState('');
  const [selectingField, setSelectingField] = useState(null); // 'origin' | 'dest' | null

  if (!isOpen) return null;

  // Lista dinâmica de locais (incorporando GPS real se disponível)
  const availableLocations = PRESET_LOCATIONS.map((loc) => {
    if (loc.id === 'current_location' && userLocation) {
      return {
        ...loc,
        coords: [userLocation.lat, userLocation.lng],
        name: `Seu local (GPS Real ±${Math.round(userLocation.accuracy || 5)}m)`,
        badge: 'GPS Navegador',
      };
    }
    return loc;
  });

  // Modos de transporte
  const travelModes = [
    { id: 'car', icon: 'fa-solid fa-car', label: 'Carro' },
    { id: 'motorcycle', icon: 'fa-solid fa-motorcycle', label: 'Moto' },
    { id: 'transit', icon: 'fa-solid fa-bus', label: 'Transporte' },
    { id: 'walking', icon: 'fa-solid fa-person-walking', label: 'A pé' },
    { id: 'bicycling', icon: 'fa-solid fa-person-biking', label: 'Bicicleta' },
  ];

  // Obter detalhes da origem e destino selecionados
  const originObj = availableLocations.find((l) => l.id === originId) || availableLocations[0];
  const destObj = availableLocations.find((l) => l.id === destinationId) || availableLocations[1];

  // Inverter Origem e Destino
  const handleSwap = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
    triggerRouteCalculation(destinationId, temp, travelMode);
  };

  const handleSelectLocation = (loc, field) => {
    if (field === 'origin') {
      setOriginId(loc.id);
      setSearchOriginText('');
      setSelectingField(null);
      triggerRouteCalculation(loc.id, destinationId, travelMode);
    } else {
      setDestinationId(loc.id);
      setSearchDestText('');
      setSelectingField(null);
      triggerRouteCalculation(originId, loc.id, travelMode);
    }
  };

  const handleModeChange = (mode) => {
    setTravelMode(mode);
    triggerRouteCalculation(originId, destinationId, mode);
  };

  const triggerRouteCalculation = (origId, dstId, mode) => {
    const o = availableLocations.find((l) => l.id === origId) || availableLocations[0];
    const d = availableLocations.find((l) => l.id === dstId) || availableLocations[1];
    if (onApplyRoute) {
      onApplyRoute({ origin: o, destination: d, mode });
    }
  };

  // Estimativas dinâmicas baseadas no modo de transporte
  const getRouteEstimates = () => {
    switch (travelMode) {
      case 'car':
        return { time: '6 min', distance: '2,1 km', traffic: 'Tráfego Fluido', risk: 'Rápido e sem esforço físico' };
      case 'motorcycle':
        return { time: '5 min', distance: '2,0 km', traffic: 'Trânsito Rápido', risk: 'Acesso rápido de emergência' };
      case 'transit':
        return { time: '14 min', distance: '2,4 km', traffic: 'Linha 2-Verde / Ônibus', risk: 'Acessível com assento reservado' };
      case 'bicycling':
        return { time: '10 min', distance: '1,9 km', traffic: 'Ciclovia Av. Paulista', risk: 'Esforço físico moderado' };
      case 'walking':
      default:
        return { time: '18 min', distance: '1,4 km', traffic: 'Via plana / Calçadas largas', risk: 'Menor esforço respiratório' };
    }
  };

  const estimates = getRouteEstimates();

  return (
    <div className="route-drawer-overlay">
      {/* 1. Header do Painel (Modos de Transporte & Fechar) */}
      <div className="route-drawer-header">
        <div className="route-drawer-menu-btn" title="Menu de Traçado">
          <i className="fa-solid fa-bars"></i>
        </div>

        <div className="travel-modes-group">
          {travelModes.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`btn-travel-mode ${travelMode === m.id ? 'active' : ''}`}
              onClick={() => handleModeChange(m.id)}
              title={m.label}
            >
              <i className={m.icon}></i>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn-route-close"
          onClick={onClose}
          title="Fechar Painel de Traçado"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* 2. Caixa de Inputs (Origem e Destino com Inversor) */}
      <div className="route-inputs-card">
        <div className="inputs-indicator-col">
          <span className="dot-origin" title="Ponto de Partida"></span>
          <div className="dots-connector">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="dot-destination" title="Destino">
            <i className="fa-solid fa-location-dot"></i>
          </span>
        </div>

        <div className="inputs-fields-col">
          {/* Campo de Origem */}
          <div className="route-input-wrapper">
            <input
              type="text"
              className="route-text-input"
              placeholder="Escolher ponto de partida ou clicar"
              value={searchOriginText || originObj.name}
              onChange={(e) => setSearchOriginText(e.target.value)}
              onFocus={() => setSelectingField('origin')}
            />
            <button
              type="button"
              className={`btn-input-locate ${isLocating ? 'locating' : ''}`}
              onClick={() => {
                if (onRequestLocation) {
                  onRequestLocation();
                  setOriginId('current_location');
                }
              }}
              title="Obter minha localização GPS via navegador"
            >
              <i className={`fa-solid ${isLocating ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'}`}></i>
            </button>
          </div>

          {/* Campo de Destino */}
          <div className="route-input-wrapper">
            <input
              type="text"
              className="route-text-input"
              placeholder="Informe o destino..."
              value={searchDestText || destObj.name}
              onChange={(e) => setSearchDestText(e.target.value)}
              onFocus={() => setSelectingField('dest')}
            />
          </div>
        </div>

        {/* Botão de Inverter Origem e Destino */}
        <button
          type="button"
          className="btn-swap-locations"
          onClick={handleSwap}
          title="Inverter Ponto de Partida e Destino"
        >
          <i className="fa-solid fa-arrows-up-down"></i>
        </button>
      </div>

      {/* 3. Atalho Rápido "Seu Local" */}
      <div className="route-quick-gps-bar" onClick={() => {
        if (onRequestLocation) onRequestLocation();
        setOriginId('current_location');
        triggerRouteCalculation('current_location', destinationId, travelMode);
      }}>
        <div className="gps-icon-circle">
          <i className={`fa-solid ${isLocating ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'}`}></i>
        </div>
        <div className="gps-text-info">
          <span className="gps-title">
            {userLocation ? 'Seu local (GPS Ativo)' : 'Obter Minha Localização Atual'}
          </span>
          <span className="gps-subtitle">
            {userLocation ? `Precisão: ±${Math.round(userLocation.accuracy || 5)}m` : 'Clique para solicitar autorização no navegador'}
          </span>
        </div>
      </div>

      {/* 4. Lista de Sugestões de Locais (quando um campo está ativo) */}
      {selectingField && (
        <div className="preset-locations-list">
          <div className="preset-list-header">
            <span>Selecione {selectingField === 'origin' ? 'o Ponto de Partida' : 'o Destino'}:</span>
            <button type="button" className="btn-close-presets" onClick={() => setSelectingField(null)}>
              Fechar
            </button>
          </div>
          {availableLocations.map((loc) => (
            <div
              key={loc.id}
              className="preset-location-item"
              onClick={() => handleSelectLocation(loc, selectingField)}
            >
              <div className={`preset-icon-circle ${loc.type}`}>
                <i className={loc.icon}></i>
              </div>
              <div className="preset-details">
                <span className="preset-name">{loc.name}</span>
                <span className="preset-badge">{loc.badge}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Resumo do Traçado & Orientações Médicas */}
      <div className="route-summary-section">
        <div className="route-estimate-card">
          <div className="estimate-header">
            <div className="time-distance">
              <span className="route-time">{estimates.time}</span>
              <span className="route-distance">({estimates.distance})</span>
            </div>
            <span className="route-best-badge">
              <i className="fa-solid fa-shield-heart"></i> Rota Segura
            </span>
          </div>

          <div className="route-steps-summary">
            <div className="step-item">
              <i className="fa-solid fa-route" style={{ color: 'var(--color-primary)' }}></i>
              <span>Trajeto: <strong>{originObj.name} &rarr; {destObj.name}</strong></span>
            </div>
            <div className="step-item">
              <i className="fa-solid fa-mountain-sun" style={{ color: 'var(--color-secondary)' }}></i>
              <span>{estimates.risk}</span>
            </div>
          </div>

          {/* Alerta de Cuidado para Paciente Eisenmenger */}
          <div className="eisenmenger-route-alert">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <div>
              <strong>Recomendação de Saúde (Eisenmenger):</strong>
              <p>Mantenha oxímetro em mãos. Em caso de saturação &lt; 85% ou cansaço súbito, acione auxílio motorizado imediato.</p>
            </div>
          </div>

          {/* Ações do Traçado */}
          <div className="route-actions-footer">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${originObj.coords[0]},${originObj.coords[1]}&destination=${destObj.coords[0]},${destObj.coords[1]}&travelmode=${travelMode}`}
              target="_blank"
              rel="noreferrer"
              className="btn-action-navigate"
            >
              <i className="fa-solid fa-location-arrow"></i>
              <span>Abrir Navegação GPS</span>
            </a>

            <button
              type="button"
              className="btn-action-clear"
              onClick={() => {
                if (onClearRoute) onClearRoute();
                onClose();
              }}
              title="Limpar Traçado do Mapa"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
