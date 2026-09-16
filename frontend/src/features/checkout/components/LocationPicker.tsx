import type { ShippingAddress } from "../types/checkout.types";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import countries from 'world-countries';
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCitiesForState, useStatesForCountry } from "../hooks/useLocationLookup";
import { MapPin, Navigation, Search } from "lucide-react";
import { LocationCombobox } from "./LocationCombobox";
import styles from "./LocationPicker.module.css";

interface LocationPickerProps {
    onAddressResolved: (partial: Partial<ShippingAddress>) => void;
    initialAddress?: Partial<ShippingAddress>;
}

const DEFAULT_CENTER: [number, number] = [14.634, -90.5069]
const DEFAULT_ZOOM = 13;

const pinIcon = L.divIcon({
    className: '',
    html: `
        <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(20,22,26,0.25))">
        <path d="M17 0C7.61 0 0 7.61 0 17c0 12.75 17 27 17 27s17-14.25 17-27C34 7.61 26.39 0 17 0z" fill="var(--accent-admin)"/>
        <circle cx="17" cy="17" r="7" fill="#FFFFFF"/>
        </svg>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 44], // tip of the pin, not the center
});

const countriesList = countries
    .map((country) => ({
        code: country.cca2,
        label: country.name.common,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

async function reverseGeocode(lat: number, lng: number) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    if (!res.ok) return null;
    return res.json();
}

async function forwardGeocode(query: string) {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
}

// Components to use useMapEvents/useMap
function ClickToPlace({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
    useMapEvents({ click: (e) => onPlace(e.latlng.lat, e.latlng.lng) });
    return null;
}

function FlyTo({ position }: { position: [number, number] | null }) {
    // useMap detects its nearest ancestor <MapContainer> to comunicate with the map
    const map = useMap();
    useEffect(() => {
        if (position)
            map.flyTo(position, 15, { duration: 0.8 });
    }, [position, map]);

    return null;
}

export function LocationPicker({ onAddressResolved, initialAddress }: LocationPickerProps) {
    const { t } = useTranslation();

    const [fields, setFields] = useState<Partial<ShippingAddress>>(initialAddress ?? {});
    const [stateCode, setStateCode] = useState<string | null>(null);
    const [marker, setMarker] = useState<[number, number] | null>(
        initialAddress?.coordinates ? [initialAddress.coordinates.lat, initialAddress.coordinates.lng] : null
    ); 
    const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [locating, setLocating] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const statesQuery = useStatesForCountry(fields.country);
    const citiesQuery = useCitiesForState(fields.country, stateCode ?? undefined);
    
    // Tracks the last field state value, so reconciliation blocks below only runs again 
    // when that value actually changes
    // reconciliation: making two different sources of the same information agree with each other.
    const [reconciledState, setReconciledState] = useState<string | undefined>(undefined);

    
    const updateField = useCallback((partial: Partial<ShippingAddress>) => {
        setFields((prev) => ({ ...prev, ...partial }));
        onAddressResolved(partial);
    }, [onAddressResolved]);

    // Reconciles a state name back to its code whenever one is missing
    // For example when editing an existing order or because a geocoded address
    if (fields.state && fields.state !== reconciledState && statesQuery.data) {
        const match = statesQuery.data.find((s) => s.name.toLowerCase() === fields.state!.toLowerCase());
        setReconciledState(fields.state);
        if (match) setStateCode(match.iso2);
    }

    function handleCountryChange(countryCode: string) {
        setStateCode(null);
        updateField({ country: countryCode, state: '', city: '' });
    }

    function handleStateChange(name: string, code: string | null) {
        setStateCode(code);
        updateField({ state: name, city: '' });
    }

    // A location was chose by click, drg, search, geolocation,
    // it place the pin, reports coordinates inmediately then fills the fields
    const placeMarker = useCallback(async (lat: number, lng: number) => {
        setMarker([lat, lng]);
        updateField({ coordinates: { lat, lng } });
        const place = await reverseGeocode(lat, lng);

        if (place?.address) {
            setStateCode(null); // let the reconciliation effect re-derive it for whatever country/state just came back

            updateField({
                city: place.address.city ?? place.address.town ?? place.address.village ?? undefined,
                state: place.address.state ?? undefined,
                country: place.address.country_code?.toUpperCase() ?? undefined,
                zip: place.address.postcode ?? undefined,
            });
        }
    }, [updateField]);

    async function handleSearch() {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setStatusMessage(null);

        try {
            const results = await forwardGeocode(searchQuery);
            if (results[0]) {
                const lat = parseFloat(results[0].lat);
                const lng = parseFloat(results[0].lon);

                setFlyTarget([lat, lng]);
                await placeMarker(lat, lng);
            } else {
                setStatusMessage(t('checkout.locationNotFound', "Couldn't find that place - try a nearby landmark, or drop a pin manually."));
            }
        } finally {
            setSearching(false);
        }
    }

    // User's location
    function handleUseMyLocation() {
        if (!navigator.geolocation) {
            setStatusMessage(t('checkout.geolocationUnsupported', 'Your browser does not support location sharing'));
            return;
        }

        setLocating(true);
        setStatusMessage(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setFlyTarget([latitude, longitude]);
                await placeMarker(latitude, longitude);
                setLocating(false);
            },
            () => {
                setStatusMessage(t('checkout.locationDenied', "Couldn't get your location - search or drop a pin manually instead."));
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 8000 },
        );
    }

    return (
        <div className="space-y-3">

            {/* Search bar */}
            <div className="flex gap-2">

                <div className="relative flex-1">
                    <Search size={16} className="pointer-events-none
                    absolute left-3 top-1/2 -translate-y-1/2 text-muted" />

                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                        placeholder={t('checkout.searchPlaceholder', 'Search address')}  
                        className="w-full rounded-xl bg-surface-2 
                        py-3 pl-9 pr-3 text-sm text-ink placeholder:text-muted" 
                    />
                </div>

                <button 
                    type="button" 
                    onClick={handleSearch} 
                    disabled={searching}
                    className="rounded-xl bg-accent-admin px-4 
                    text-sm font-semibold text-white disabled:opacity-50"
                >
                    {searching ? '...' : t('checkout.search', 'Search')}
                </button>
            </div>

            {/* Map */}
            <div
                className={`overflow-hidden rounded-2xl border border-border ${styles.mapWrap}`}
            >
                <MapContainer 
                    center={marker ?? DEFAULT_CENTER}
                    zoom={marker ? 15 : DEFAULT_ZOOM}
                    scrollWheelZoom
                    style={{ height: '250px', width: '100%' }}
                >
                    <TileLayer 
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickToPlace onPlace={placeMarker} />
                    <FlyTo position={flyTarget} />
                    
                    {marker && (
                        <Marker 
                            position={marker}
                            icon={pinIcon}
                            draggable
                            eventHandlers={{ dragend: (e) => {
                                const { lat, lng } = e.target.getLatLng();
                                placeMarker(lat, lng);
                            } }}
                        />
                    )}
                </MapContainer>
            </div>
                    
            {/* Use my location button */}
            <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating}
                className="flex w-full items-center justify-center
                gap-2 rounded-xl border border-border bg-surface-2/60
                py-2.5 text-sm font-medium text-ink backdrop-blur-lg
                disabled:opacity-50"
            >
                <Navigation size={16} />
                {locating ? t('checkout.locating', 'Getting your location...') : t('checkout.useMyLocation', 'Use my location')}
            </button>

            {statusMessage && <p className="text-xs text-danger">{statusMessage}</p>}

            {/* Instructions */}
            <p className="flex items-start gap-1.5 text-xs text-muted">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                {t('checkout.mapHint', 'Search, tap the map, or drag the pin to set your exact delivery spot, or fill the next fields')}
            </p>

            {/* Country field */}
            <label className="block text-xs font-medium text-muted">
                {t('checkout.country', 'Country')}

                <select 
                    value={fields.country ?? ''}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-surface-2 p-3
                    text-sm text-ink"
                >
                    <option value="" disabled>{t('checkout.selectCountry', 'Select a country')}</option>
                    {countriesList.map((country) => (
                        <option key={country.code} value={country.code}>{country.label}</option>
                    ))}
                </select>
            </label>

            {/* Departament/State */}
            <label className="block text-xs font-medium text-muted">
                {t('checkout.departament', 'State / Departament')}

                <div className="mt-1">
                    <LocationCombobox
                        value={fields.state ?? ''}
                        options={(statesQuery.data ?? []).map((s) => ({ code: s.iso2, name: s.name }))}
                        onSelect={handleStateChange}
                        placeholder={t('checkout.selectDepartament')}
                        disabled={!fields.country}
                        disabledMessage={t('checkout.selectCountryFirst', 'Select a country first')}
                        loading={statesQuery.isLoading}
                    />
                </div>
            </label>

            {/* City */}
            <label className="block text-xs font-medium text-muted">
                {t('checkout.city', 'City')}

                <div className="mt-1">
                    <LocationCombobox
                        value={fields.city ?? ''}
                        options={(citiesQuery.data ?? []).map((c) => ({ code: String(c.id), name: c.name }))}
                        onSelect={(name) => updateField({ city: name })}
                        placeholder={t('checkout.selectCity')}
                        disabled={!stateCode}
                        disabledMessage={t('checkout.selectDepartmentFirst', 'Select a State/Department first')}
                        loading={citiesQuery.isLoading}
                    />
                </div>
            </label>

            {/* Reference */}
            <label className="block text-xs font-medium text-muted">
                {t('checkout.reference', 'Detailed address and reference (house color, door color, etc)')}

                <input 
                    value={fields.reference ?? ''}
                    onChange={(e) => updateField({ reference: e.target.value })}
                    className="mt-1 w-full rounded-xl bg-surface-2 p-3 text-sm
                    text-ink placeholder:text-muted"
                    placeholder={t('checkout.referencePlaceholder', 'e.g. 15th Av. 2nd Street ... Green house')}
                />
            </label>

            {/* Zip code */}
            <label className="block text-xs font-medium text-muted">
                {t('checkout.zip', 'Postal code (optional)')}

                <input 
                    value={fields.zip ?? ''}
                    onChange={(e) => updateField({ zip: e.target.value })}
                    className="mt-1 w-full rounded-xl bg-surface-2 p-3 text-sm
                    text-ink placeholder:text-muted"
                    placeholder={t('checkout.zipPlaceholder', 'e.g. 01001')}
                />
            </label>
        </div>
    );
}


    