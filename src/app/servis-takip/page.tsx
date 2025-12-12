'use client';

import { useState, useEffect, useCallback } from 'react';
import GPSMap from '@/components/maps/GPSMap';
import { useGPSTracking } from '@/hooks/useGPSTracking';

interface RouteStop {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    estimatedTime?: string;
    status: 'pending' | 'arrived' | 'departed';
}

interface ServiceRoute {
    id: string;
    name: string;
    vehiclePlate: string;
    driverName: string;
    status: 'not_started' | 'in_progress' | 'completed';
    stops: RouteStop[];
    currentLocation?: {
        latitude: number;
        longitude: number;
        updatedAt: string;
    };
}

// Mock data - replace with API calls
const MOCK_ROUTES: ServiceRoute[] = [
    {
        id: '1',
        name: 'Sabah Servisi - Kadıköy',
        vehiclePlate: '34 ABC 123',
        driverName: 'Ahmet Yılmaz',
        status: 'in_progress',
        stops: [
            { id: 's1', name: 'Kadıköy Merkez', latitude: 40.9903, longitude: 29.0230, estimatedTime: '07:30', status: 'departed' },
            { id: 's2', name: 'Fenerbahçe', latitude: 40.9697, longitude: 29.0369, estimatedTime: '07:45', status: 'arrived' },
            { id: 's3', name: 'Bostancı', latitude: 40.9619, longitude: 29.0925, estimatedTime: '08:00', status: 'pending' },
            { id: 's4', name: 'Okul', latitude: 41.0082, longitude: 28.9784, estimatedTime: '08:30', status: 'pending' },
        ],
        currentLocation: {
            latitude: 40.9697,
            longitude: 29.0369,
            updatedAt: new Date().toISOString(),
        },
    },
    {
        id: '2',
        name: 'Sabah Servisi - Beşiktaş',
        vehiclePlate: '34 XYZ 456',
        driverName: 'Mehmet Kaya',
        status: 'in_progress',
        stops: [
            { id: 's5', name: 'Beşiktaş Meydanı', latitude: 41.0422, longitude: 29.0069, estimatedTime: '07:20', status: 'departed' },
            { id: 's6', name: 'Ortaköy', latitude: 41.0479, longitude: 29.0276, estimatedTime: '07:35', status: 'departed' },
            { id: 's7', name: 'Okul', latitude: 41.0082, longitude: 28.9784, estimatedTime: '08:15', status: 'pending' },
        ],
        currentLocation: {
            latitude: 41.0479,
            longitude: 29.0276,
            updatedAt: new Date().toISOString(),
        },
    },
];

export default function ServiceTrackingPage() {
    const [routes, setRoutes] = useState<ServiceRoute[]>(MOCK_ROUTES);
    const [selectedRoute, setSelectedRoute] = useState<ServiceRoute | null>(null);
    const [isLive, setIsLive] = useState(false);

    const { location: myLocation, isTracking, startTracking, stopTracking } = useGPSTracking({
        updateInterval: 10000,
    });

    // Simulate live updates
    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            setRoutes(prev => prev.map(route => ({
                ...route,
                currentLocation: route.currentLocation ? {
                    ...route.currentLocation,
                    latitude: route.currentLocation.latitude + (Math.random() - 0.5) * 0.001,
                    longitude: route.currentLocation.longitude + (Math.random() - 0.5) * 0.001,
                    updatedAt: new Date().toISOString(),
                } : undefined,
            })));
        }, 5000);

        return () => clearInterval(interval);
    }, [isLive]);

    const mapMarkers = selectedRoute
        ? selectedRoute.stops.map(stop => ({
            id: stop.id,
            latitude: stop.latitude,
            longitude: stop.longitude,
            title: stop.name,
            info: `${stop.estimatedTime} - ${stop.status === 'departed' ? 'Geçti' : stop.status === 'arrived' ? 'Vardı' : 'Bekliyor'}`,
            icon: stop.status === 'departed'
                ? '🟢'
                : stop.status === 'arrived'
                    ? '🟡'
                    : '⚪',
        }))
        : routes.filter(r => r.currentLocation).map(route => ({
            id: route.id,
            latitude: route.currentLocation!.latitude,
            longitude: route.currentLocation!.longitude,
            title: route.name,
            info: `${route.vehiclePlate} - ${route.driverName}`,
        }));

    const mapRoutes = selectedRoute
        ? [{
            id: selectedRoute.id,
            points: selectedRoute.stops.map(s => ({ lat: s.latitude, lng: s.longitude })),
            color: '#4285F4',
            width: 4,
        }]
        : [];

    const currentVehicleLocation = selectedRoute?.currentLocation
        ? { latitude: selectedRoute.currentLocation.latitude, longitude: selectedRoute.currentLocation.longitude }
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            🚌 Servis Takip
                        </h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsLive(!isLive)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isLive
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {isLive ? '🔴 Canlı' : '⏸️ Duraklatıldı'}
                            </button>
                            <button
                                onClick={isTracking ? stopTracking : startTracking}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                {isTracking ? '📍 Konumum Kapalı' : '📍 Konumumu Göster'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Route List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Aktif Servisler</h2>

                        {routes.map(route => (
                            <div
                                key={route.id}
                                onClick={() => setSelectedRoute(selectedRoute?.id === route.id ? null : route)}
                                className={`p-4 bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${selectedRoute?.id === route.id
                                        ? 'border-blue-500'
                                        : 'border-transparent'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{route.name}</h3>
                                        <p className="text-sm text-gray-500">{route.vehiclePlate}</p>
                                        <p className="text-sm text-gray-500">👤 {route.driverName}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${route.status === 'in_progress'
                                            ? 'bg-green-100 text-green-800'
                                            : route.status === 'completed'
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {route.status === 'in_progress' ? 'Yolda' : route.status === 'completed' ? 'Tamamlandı' : 'Başlamadı'}
                                    </span>
                                </div>

                                {route.currentLocation && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Son güncelleme: {new Date(route.currentLocation.updatedAt).toLocaleTimeString('tr-TR')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <GPSMap
                                markers={mapMarkers}
                                routes={mapRoutes}
                                currentLocation={currentVehicleLocation || (myLocation ? { latitude: myLocation.latitude, longitude: myLocation.longitude } : null)}
                                showCurrentLocation={true}
                                height="500px"
                                className="rounded-lg overflow-hidden"
                                onMarkerClick={(marker) => {
                                    const route = routes.find(r => r.id === marker.id);
                                    if (route) setSelectedRoute(route);
                                }}
                            />
                        </div>

                        {/* Selected Route Stops */}
                        {selectedRoute && (
                            <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    {selectedRoute.name} - Duraklar
                                </h3>
                                <div className="space-y-3">
                                    {selectedRoute.stops.map((stop, index) => (
                                        <div
                                            key={stop.id}
                                            className="flex items-center gap-3"
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${stop.status === 'departed'
                                                    ? 'bg-green-500'
                                                    : stop.status === 'arrived'
                                                        ? 'bg-yellow-500'
                                                        : 'bg-gray-300'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{stop.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Tahmini: {stop.estimatedTime}
                                                </p>
                                            </div>
                                            <span className={`text-sm ${stop.status === 'departed'
                                                    ? 'text-green-600'
                                                    : stop.status === 'arrived'
                                                        ? 'text-yellow-600'
                                                        : 'text-gray-400'
                                                }`}>
                                                {stop.status === 'departed' ? '✓ Geçti' : stop.status === 'arrived' ? '📍 Burada' : 'Bekliyor'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
