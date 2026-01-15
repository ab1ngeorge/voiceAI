import { MapPin, ExternalLink, Clock, Navigation } from 'lucide-react';
import type { CampusLocation } from '../data/locations';

interface LocationPanelProps {
    location: CampusLocation;
    onClose?: () => void;
}

export function LocationPanel({ location, onClose }: LocationPanelProps) {
    const handleOpenMaps = () => {
        window.open(location.mapsUrl, '_blank', 'noopener,noreferrer');
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            admin: 'Administration',
            academic: 'Academic',
            facility: 'Facility',
            hostel: 'Accommodation',
            sports: 'Sports',
            amenity: 'Student Service',
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-blue-500/20 text-blue-400',
            academic: 'bg-purple-500/20 text-purple-400',
            facility: 'bg-emerald-500/20 text-emerald-400',
            hostel: 'bg-orange-500/20 text-orange-400',
            sports: 'bg-yellow-500/20 text-yellow-400',
            amenity: 'bg-pink-500/20 text-pink-400',
        };
        return colors[category] || 'bg-slate-500/20 text-slate-400';
    };

    return (
        <div className="location-card animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{location.name}</h3>
                        {location.malayalamName && (
                            <p className="text-sm text-slate-400">{location.malayalamName}</p>
                        )}
                    </div>
                </div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Category Badge */}
            <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(location.category)}`}>
                    {getCategoryLabel(location.category)}
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 mb-3">{location.description}</p>

            {/* Timings if available */}
            {location.timings && (
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{location.timings}</span>
                </div>
            )}

            {/* Maps Button */}
            <button
                onClick={handleOpenMaps}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-gradient-to-r from-primary-500 to-primary-600 
                   text-white font-medium rounded-lg
                   hover:from-primary-600 hover:to-primary-700
                   transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/30
                   active:scale-[0.98]"
            >
                <Navigation className="w-5 h-5" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-4 h-4" />
            </button>
        </div>
    );
}

// Compact location button for inline display
interface LocationButtonProps {
    location: CampusLocation;
}

export function LocationButton({ location }: LocationButtonProps) {
    const handleOpenMaps = () => {
        window.open(location.mapsUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleOpenMaps}
            className="inline-flex items-center gap-2 px-3 py-2 mt-2
                 bg-gradient-to-r from-primary-500/20 to-primary-600/20 
                 border border-primary-500/30
                 text-primary-400 text-sm font-medium rounded-lg
                 hover:from-primary-500/30 hover:to-primary-600/30
                 hover:border-primary-500/50
                 transition-all duration-200"
        >
            <MapPin className="w-4 h-4" />
            <span>View on Maps</span>
            <ExternalLink className="w-3 h-3" />
        </button>
    );
}
