//frontend\src\components\LocationPicker.jsx
import { useState, useEffect, useRef } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

function LocationPicker({ value, onChange, placeholder = "Search for a location...", className = "" }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);


    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2 && showSuggestions) {
                setLoading(true);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
                    const data = await response.json();
                    setSuggestions(data);
                } catch (error) {
                    console.error("Error fetching locations:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, showSuggestions]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setQuery(newValue);
        onChange(newValue);
        setShowSuggestions(true);
    };

    const handleSelect = (place) => {
        const address = place.address;
        let locationName = place.display_name;

        if (address) {
            const city = address.city || address.town || address.village || address.hamlet || address.suburb;
            const state = address.state || address.county || address.province;
            const country = address.country;

            const parts = [];
            if (city) parts.push(city);
            if (state) parts.push(state);
            if (country) parts.push(country);

            if (parts.length > 0) {
                locationName = parts.join(', ');
            }
        }

        setQuery(locationName);
        onChange(locationName);
        setShowSuggestions(false);
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                    placeholder={placeholder}
                />
                <MapPinIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>

            {showSuggestions && (query.length > 2) && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
                    ) : suggestions.length > 0 ? (
                        <ul>
                            {suggestions.map((place) => (
                                <li
                                    key={place.place_id}
                                    onClick={() => handleSelect(place)}
                                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0 flex items-start"
                                >
                                    <MapPinIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                                    <span>{place.display_name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default LocationPicker;
