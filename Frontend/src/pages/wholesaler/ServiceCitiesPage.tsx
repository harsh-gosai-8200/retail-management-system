// src/pages/wholesaler/ServiceCitiesPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    MapPin,
    Plus,
    Loader2,
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    Building2,
    Globe,
    ChevronDown,
    Edit2,
    Save,
    Trash2,
    Search,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { locationService } from '../../services/locationService';
import { Button } from '../../components/ui/button';
import type { ServiceCity, AddServiceCityRequest } from '../../types/location';
import { useConfirm } from '../../context/ConfirmContext';

interface StateData {
    id: number;
    name: string;
    code: string;
    cities: string[];
}

export function ServiceCitiesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { confirm } = useConfirm();
    const wholesalerId = user?.id;

    const [serviceCities, setServiceCities] = useState<ServiceCity[]>([]);
    const [states, setStates] = useState<StateData[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [selectedState, setSelectedState] = useState<StateData | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCities, setFilteredCities] = useState<string[]>([]);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const isFirstTime = serviceCities.length === 0;

    useEffect(() => {
        loadLocalData();
    }, []);

    useEffect(() => {
        if (wholesalerId) {
            loadServiceCities();
        }
    }, [wholesalerId]);

    useEffect(() => {
        if (location.state?.message) {
            setError(location.state.message);
            setTimeout(() => setError(null), 5000);
        }
    }, [location]);

    const loadLocalData = async () => {
        setLoadingData(true);
        try {
            const response = await fetch('/india_data.json');
            const data = await response.json();
            setStates(data.states);
        } catch (err) {
            console.error('Failed to load local data:', err);
            setError('Failed to load states and cities data. Please refresh the page.');
        } finally {
            setLoadingData(false);
        }
    };

    const loadServiceCities = async () => {
        try {
            const data = await locationService.getServiceCities(wholesalerId!);
            setServiceCities(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = cities.filter(city =>
                city.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCities(filtered);
            setShowCityDropdown(true);
        } else {
            setFilteredCities(cities);
            setShowCityDropdown(false);
        }
    }, [searchQuery, cities]);

    const handleSelectState = (state: StateData) => {
        setSelectedState(state);
        setCities(state.cities);
        setSelectedCity(null);
        setSearchQuery('');
        setFilteredCities(state.cities);
        setShowCityDropdown(false);
    };

    const handleSelectCity = (city: string) => {
        setSelectedCity(city);
        setSearchQuery(city);
        setShowCityDropdown(false);
    };

    const addServiceCity = async () => {
        if (!selectedState || !selectedCity) {
            setError('Please select a state and city');
            return;
        }

        if (serviceCities.some(sc => sc.cityName === selectedCity)) {
            setError(`${selectedCity} is already in your service areas`);
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const request: AddServiceCityRequest = {
                cityId: Date.now(),
                cityName: selectedCity,
                stateId: selectedState.id,
                stateName: selectedState.name
            };

            await locationService.addServiceCity(wholesalerId!, request);
            await loadServiceCities();

            setSelectedState(null);
            setSelectedCity(null);
            setSearchQuery('');
            setCities([]);

            setSuccess(`Added ${selectedCity} to your service areas`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const removeServiceCity = async (cityId: number, cityName: string) => {
        const ok = await confirm(
            `Remove ${cityName} from your service areas?`,
            "danger"
        );

        if (!ok) return;

        setSaving(true);
        try {
            await locationService.removeServiceCity(wholesalerId!, cityId);
            await loadServiceCities();
            setSuccess(`Removed ${cityName} from service areas`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleProceedToProducts = () => {
        if (serviceCities.length === 0) {
            setError('Please add at least one service city before adding products');
            return;
        }
        navigate('/wholesaler/products');
    };

    const citiesByState = serviceCities.reduce((acc, city) => {
        if (!acc[city.stateName]) {
            acc[city.stateName] = [];
        }
        acc[city.stateName].push(city);
        return acc;
    }, {} as Record<string, ServiceCity[]>);

    if (loading || loadingData) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
                    <p className="mt-3 text-sm text-slate-500">Loading service areas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Service Areas
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {isEditing
                            ? "Add or remove cities where you deliver products"
                            : "Manage cities where local sellers can order from you"}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 shadow-sm"
                >
                    {isEditing ? (
                        <>
                            <Save className="h-4 w-4" />
                            Done Editing
                        </>
                    ) : (
                        <>
                            <Edit2 className="h-4 w-4" />
                            Edit Service Areas
                        </>
                    )}
                </Button>
            </div>

            {/* First Time Banner */}
            {isFirstTime && !isEditing && (
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-blue-100 p-2.5">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-blue-900">Welcome to Service Areas</p>
                            <p className="mt-1 text-sm text-blue-700">
                                Add the cities where you can deliver products. Local sellers in these cities will be able to see and order from you.
                            </p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-800 underline-offset-2 hover:underline"
                            >
                                Get Started →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span className="text-sm text-green-700">{success}</span>
                    </div>
                </div>
            )}

            {/* Add City Form */}
            {isEditing && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="rounded-lg bg-blue-50 p-1.5">
                            <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <h2 className="text-base font-semibold text-slate-900">Add New Service City</h2>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {/* State Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                State <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedState?.id || ''}
                                    onChange={(e) => {
                                        const state = states.find(s => s.id === Number(e.target.value));
                                        if (state) handleSelectState(state);
                                    }}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors appearance-none"
                                >
                                    <option value="">-- Select State --</option>
                                    {states.map((state) => (
                                        <option key={state.id} value={state.id}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* City Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                City <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => selectedState && setShowCityDropdown(true)}
                                    placeholder={selectedState ? "Search or select city..." : "Select state first"}
                                    disabled={!selectedState}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-500 transition-colors"
                                />

                                {showCityDropdown && selectedState && filteredCities.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-150">
                                        {filteredCities.map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => handleSelectCity(city)}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedState && (
                                <p className="mt-1.5 text-xs text-slate-400">
                                    {filteredCities.length} {filteredCities.length === 1 ? 'city' : 'cities'} available
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <Button
                            onClick={addServiceCity}
                            disabled={saving || !selectedCity}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-all"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            Add City
                        </Button>
                    </div>
                </div>
            )}

            {/* Service Cities List */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-slate-100 p-1.5">
                            <Globe className="h-4 w-4 text-slate-600" />
                        </div>
                        <h2 className="text-base font-semibold text-slate-900">Your Service Areas</h2>
                    </div>
                    {serviceCities.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                                {serviceCities.length}
                            </span>
                            <span>city{serviceCities.length !== 1 ? 's' : ''}</span>
                            <span className="text-slate-300">•</span>
                            <span>{Object.keys(citiesByState).length} state{Object.keys(citiesByState).length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>

                {serviceCities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-12 px-4 text-center">
                        <div className="rounded-full bg-slate-100 p-3">
                            <MapPin className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="mt-3 font-medium text-slate-900">No service areas added yet</p>
                        <p className="mt-1 text-sm text-slate-500">
                            {isEditing
                                ? "Select a state and city above to get started"
                                : "Click 'Edit Service Areas' to add your first city"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(citiesByState).map(([stateName, cities]) => (
                            <div key={stateName}>
                                <h3 className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    {stateName}
                                    <span className="text-xs font-normal text-slate-400">
                                        ({cities.length})
                                    </span>
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {cities.map((city) => (
                                        <div
                                            key={city.id}
                                            className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-150 ${isEditing
                                                ? 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
                                                : 'bg-slate-100 text-slate-700'
                                                }`}
                                        >
                                            <MapPin className={`h-3.5 w-3.5 ${isEditing ? 'text-blue-500' : 'text-slate-500'}`} />
                                            <span>{city.cityName}</span>
                                            {isEditing && (
                                                <button
                                                    onClick={() => removeServiceCity(city.cityId, city.cityName)}
                                                    className="ml-1 rounded-full p-0.5 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all duration-150"
                                                    title="Remove city"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Warning Banner */}
            {serviceCities.length === 0 && !isEditing && (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                        <div>
                            <p className="font-medium text-yellow-800">No service areas configured</p>
                            <p className="mt-1 text-sm text-yellow-700">
                                Local sellers won't see your products until you add at least one service city.
                            </p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-3 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline-offset-2 hover:underline"
                            >
                                Configure now →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Button */}
            {!isEditing && (
                <div className="flex justify-end">
                    <Button
                        onClick={handleProceedToProducts}
                        disabled={serviceCities.length === 0}
                        className="bg-green-600 hover:bg-green-700 shadow-sm disabled:opacity-50 transition-all"
                    >
                        {serviceCities.length === 0 ? 'Add Service Cities to Continue' : 'Proceed to Products →'}
                    </Button>
                </div>
            )}
        </div>
    );
}