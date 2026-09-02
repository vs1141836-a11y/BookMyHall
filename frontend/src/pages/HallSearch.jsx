import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, CheckSquare, Star, ArrowRightLeft, Sparkles, Map as MapIcon, Grid, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getPrimaryHallPhoto } from '../utils/getHallImages';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue in production
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Recenter component
function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, 12);
  return null;
}

export default function HallSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter States
  const [halls, setHalls] = useState([]);
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [capacity, setCapacity] = useState(searchParams.get('capacity') || '');
  const [isAC, setIsAC] = useState(searchParams.get('isAC') || '');
  const [hasParking, setHasParking] = useState(searchParams.get('hasParking') || '');
  const [availabilityDate, setAvailabilityDate] = useState(searchParams.get('availabilityDate') || '');

  // Comparison State
  const [compareIds, setCompareIds] = useState([]);
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' (cards + map), 'grid' (cards only)
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default Bangalore
  const [isNearby, setIsNearby] = useState(false);
  const [searchedCity, setSearchedCity] = useState('');

  useEffect(() => {
    setCity(searchParams.get('city') || '');
    setArea(searchParams.get('area') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setCapacity(searchParams.get('capacity') || '');
    setIsAC(searchParams.get('isAC') || '');
    setHasParking(searchParams.get('hasParking') || '');
    setAvailabilityDate(searchParams.get('availabilityDate') || '');
    fetchHalls();
  }, [searchParams]);

  const getFallbackHalls = () => {
    const allHalls = [
      {
        _id: 'fb_hall_1',
        name: 'Grand Palace Convention Center',
        description: 'Experience majestic grandeur at our flagship luxury palace convention center. Suitable for ultra-premium weddings, cultural events, and high-profile exhibitions.',
        address: 'Palace Grounds, Gate 4, Sadashivanagar',
        city: 'Bangalore',
        area: 'Palace Grounds',
        coordinates: { lat: 13.0035, lng: 77.5891 },
        capacity: 1500,
        diningCapacity: 800,
        parkingCapacity: 400,
        isAC: true,
        roomsCount: 12,
        amenities: ['Central Air Conditioning', 'Valet Parking', 'Bridal Suites'],
        photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600'],
        basePrice: 150000,
        rating: 4.8
      },
      {
        _id: 'fb_hall_2',
        name: 'Tulip Celebration Banquet',
        description: 'A cozy yet fully-equipped elegant banquet hall, perfect for corporate meetings, birthday celebrations, baby showers, naming ceremonies, and family functions.',
        address: '80 Feet Road, HAL Stage 2',
        city: 'Bangalore',
        area: 'Indiranagar',
        coordinates: { lat: 12.9649, lng: 77.6394 },
        capacity: 350,
        diningCapacity: 150,
        parkingCapacity: 30,
        isAC: true,
        roomsCount: 4,
        amenities: ['Central Air Conditioning', 'Basic AV Setup', 'Valet Parking'],
        photos: ['https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=600'],
        basePrice: 45000,
        rating: 4.5
      },
      {
        _id: 'fb_hall_3',
        name: 'Royal Orchid Gardens',
        description: 'Sprawling outdoor green lawns combined with an air-conditioned luxury glass-domed banquet, ideal for grand starlight wedding receptions and concerts.',
        address: 'ECC Road, near ITPL',
        city: 'Bangalore',
        area: 'Whitefield',
        coordinates: { lat: 12.9698, lng: 77.7499 },
        capacity: 2000,
        diningCapacity: 1000,
        parkingCapacity: 500,
        isAC: true,
        roomsCount: 20,
        amenities: ['Central AC', 'Lawn Seating', 'Infinity Pool view'],
        photos: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600'],
        basePrice: 220000,
        rating: 4.9
      },
      {
        _id: 'fb_hall_4',
        name: 'Silicon Valley Banquet Hall',
        description: 'Cozy and modern business-friendly banquet hall, highly popular for product launches, tech meetups, and corporate anniversary dinners.',
        address: '100 Feet Road, Koramangala 4th Block',
        city: 'Bangalore',
        area: 'Koramangala',
        coordinates: { lat: 12.9352, lng: 77.6245 },
        capacity: 200,
        diningCapacity: 100,
        parkingCapacity: 15,
        isAC: true,
        roomsCount: 2,
        amenities: ['Projector System', 'Wi-Fi Access', 'Central AC'],
        photos: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600'],
        basePrice: 30000,
        rating: 4.2
      },
      {
        _id: 'fb_hall_5',
        name: 'Bandra Heights Grand Ballroom',
        description: 'Bandra Heights Grand Ballroom offers unmatched luxury and sweeping coastal breezes for Mumbai high society weddings and grand corporate conventions.',
        address: 'Linking Road Extension, Bandra West',
        city: 'Mumbai',
        area: 'Bandra West',
        coordinates: { lat: 19.0544, lng: 72.8402 },
        capacity: 800,
        diningCapacity: 400,
        parkingCapacity: 100,
        isAC: true,
        roomsCount: 8,
        amenities: ['Central AC', 'Sea view deck', 'Infinity pool background'],
        photos: ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600'],
        basePrice: 220000,
        rating: 4.9
      },
      {
        _id: 'fb_hall_6',
        name: 'Marine Drive Ocean View Banquet',
        description: 'Exquisite boutique banquet hall right on Marine Drive. Features complete floor-to-ceiling glass windows overlooking the Arabian Sea, perfect for sunsets and dinners.',
        address: 'Netaji Subhash Chandra Bose Road',
        city: 'Mumbai',
        area: 'Marine Drive',
        coordinates: { lat: 18.9431, lng: 72.8230 },
        capacity: 500,
        diningCapacity: 250,
        parkingCapacity: 40,
        isAC: true,
        roomsCount: 6,
        amenities: ['Central AC', 'Sea Facing Views', 'Valet Parking'],
        photos: ['https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=600'],
        basePrice: 180000,
        rating: 4.7
      },
      {
        _id: 'fb_hall_7',
        name: 'Juhu Residency Celebration Hall',
        description: 'A beautiful beachside destination vibe right in the middle of Mumbai. Offers direct views of Juhu beach and an air-conditioned banquet hall with high ceilings.',
        address: 'Juhu Tara Road, near beach access',
        city: 'Mumbai',
        area: 'Juhu',
        coordinates: { lat: 19.1026, lng: 72.8270 },
        capacity: 400,
        diningCapacity: 200,
        parkingCapacity: 25,
        isAC: true,
        roomsCount: 5,
        amenities: ['AC Hall', 'Juhu Beach access', 'Lawn deck'],
        photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600'],
        basePrice: 90000,
        rating: 4.4
      },
      {
        _id: 'fb_hall_8',
        name: 'Gateway Celebration Plaza',
        description: 'Immaculately restored historic-themed ballroom situated near the Gateway of India. Featuring teak-wood paneling, high arches, and premium colonial-style dining packages.',
        address: 'Apollo Bunder, Colaba',
        city: 'Mumbai',
        area: 'Colaba',
        coordinates: { lat: 18.9220, lng: 72.8347 },
        capacity: 1200,
        diningCapacity: 600,
        parkingCapacity: 150,
        isAC: true,
        roomsCount: 15,
        amenities: ['Central AC', 'Historic Decor', 'Valet Parking'],
        photos: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600'],
        basePrice: 250000,
        rating: 4.8
      },
      {
        _id: 'fb_hall_9',
        name: 'OMR Tech Park Convention Center',
        description: 'A modern, high-tech, spacious convention center specifically optimized for massive IT events, large corporate trade fairs, and software conferences.',
        address: 'OMR Expressway, near Sholinganallur',
        city: 'Chennai',
        area: 'OMR',
        coordinates: { lat: 12.9654, lng: 80.2462 },
        capacity: 1000,
        diningCapacity: 500,
        parkingCapacity: 200,
        isAC: true,
        roomsCount: 10,
        amenities: ['Gigabit Wi-Fi', 'AC Halls', 'Projector arrays'],
        photos: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600'],
        basePrice: 110000,
        rating: 4.6
      },
      {
        _id: 'fb_hall_10',
        name: 'Marina Beach Banquet Hall',
        description: 'Traditional and historic boutique banquet hall in Mylapore, specialized in hosting classical programs, naming ceremonies, and traditional feasts.',
        address: 'Luz Church Road, Mylapore',
        city: 'Chennai',
        area: 'Mylapore',
        coordinates: { lat: 13.0330, lng: 80.2685 },
        capacity: 300,
        diningCapacity: 150,
        parkingCapacity: 20,
        isAC: true,
        roomsCount: 3,
        amenities: ['Traditional Decor', 'AC Halls', 'Traditional dining tables'],
        photos: ['https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=600'],
        basePrice: 40000,
        rating: 4.3
      },
      {
        _id: 'fb_hall_11',
        name: 'East Coast Road Luxury Resort',
        description: 'Premium seaside resort lawn and banquet hall. Offers a majestic panoramic view of the Bay of Bengal, palm trees, and ECR coastal breeze.',
        address: 'ECR Highway, Muttukadu',
        city: 'Chennai',
        area: 'ECR',
        coordinates: { lat: 12.8906, lng: 80.2372 },
        capacity: 1500,
        diningCapacity: 700,
        parkingCapacity: 300,
        isAC: true,
        roomsCount: 18,
        amenities: ['Central AC', 'Resort Lawns', 'Sea View Deck'],
        photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600'],
        basePrice: 190000,
        rating: 4.8
      },
      {
        _id: 'fb_hall_12',
        name: 'Chennai Heritage Cultural Center',
        description: 'Located in the heart of T-Nagar shopping hub. Features traditional Dravidian architecture details on wooden pillars, grand stage lights, and AC halls.',
        address: 'G N Chetty Road, T-Nagar',
        city: 'Chennai',
        area: 'T-Nagar',
        coordinates: { lat: 13.0418, lng: 80.2337 },
        capacity: 750,
        diningCapacity: 350,
        parkingCapacity: 80,
        isAC: true,
        roomsCount: 8,
        amenities: ['AC Hall', 'Dravidian Pillars architecture', 'Valet Parking'],
        photos: ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600'],
        basePrice: 85000,
        rating: 4.5
      }
    ];

    const cityParam = searchParams.get('city');
    if (cityParam) {
      const searched = cityParam.trim().toLowerCase();
      const matches = allHalls.filter(h => h.city.toLowerCase().includes(searched));
      if (matches.length > 0) {
        return { fallbackData: matches, isFallbackNearby: false };
      }

      // Dynamic geodistance calculations for fallback data
      const CITY_COORDINATES = {
        bangalore: { lat: 12.9716, lng: 77.5946 },
        mumbai: { lat: 19.0760, lng: 72.8777 },
        chennai: { lat: 13.0827, lng: 80.2707 },
        delhi: { lat: 28.6139, lng: 77.2090 },
        hyderabad: { lat: 17.3850, lng: 78.4867 },
        kolkata: { lat: 22.5726, lng: 88.3639 },
        pune: { lat: 18.5204, lng: 73.8567 }
      };

      const refCoords = CITY_COORDINATES[searched] || { lat: 12.9716, lng: 77.5946 };

      const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const hallsWithDist = allHalls.map(hall => {
        const lat = hall.coordinates?.lat || 12.9716;
        const lng = hall.coordinates?.lng || 77.5946;
        const dist = getDistance(refCoords.lat, refCoords.lng, lat, lng);
        const distance = Number(dist.toFixed(1));
        const minutes = Math.round((dist / 50) * 60);
        let travelTime = '';
        if (minutes < 60) {
          travelTime = `${minutes} mins`;
        } else {
          const hrs = Math.floor(minutes / 60);
          const mins = minutes % 60;
          travelTime = mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hrs`;
        }
        return { ...hall, distance, travelTime };
      });

      hallsWithDist.sort((a, b) => a.distance - b.distance);
      return { fallbackData: hallsWithDist, isFallbackNearby: true };
    }

    return { fallbackData: allHalls, isFallbackNearby: false };
  };

  const fetchHalls = async () => {
    try {
      const res = await axios.get('/halls', { params: Object.fromEntries(searchParams) });
      let data = res.data.data;
      
      setIsNearby(res.data.isNearbySuggestions || false);
      setSearchedCity(res.data.searchedLocation || '');

      if (!data || data.length === 0) {
        const { fallbackData, isFallbackNearby } = getFallbackHalls();
        data = fallbackData;
        setIsNearby(isFallbackNearby);
      }
      setHalls(data);
      if (data.length > 0 && data[0].coordinates) {
        const coords = data[0].coordinates;
        setMapCenter([coords.lat || 12.9716, coords.lng || 77.5946]);
      }
    } catch (err) {
      console.error('Error fetching halls from server, loading fallbacks:', err);
      const { fallbackData, isFallbackNearby } = getFallbackHalls();
      setHalls(fallbackData);
      setIsNearby(isFallbackNearby);
      if (fallbackData.length > 0 && fallbackData[0].coordinates) {
        const coords = fallbackData[0].coordinates;
        setMapCenter([coords.lat || 12.9716, coords.lng || 77.5946]);
      }
    }
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    const params = {};
    if (city) params.city = city;
    if (area) params.area = area;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (capacity) params.capacity = capacity;
    if (isAC) params.isAC = isAC;
    if (hasParking) params.hasParking = hasParking;
    if (availabilityDate) params.availabilityDate = availabilityDate;
    
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setCity('');
    setArea('');
    setMinPrice('');
    setMaxPrice('');
    setCapacity('');
    setIsAC('');
    setHasParking('');
    setAvailabilityDate('');
    setSearchParams({});
  };

  const handleCompareToggle = (id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 halls at a time.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const startComparison = () => {
    if (compareIds.length < 2) {
      alert('Select at least 2 halls to compare.');
      return;
    }
    navigate(`/compare?ids=${compareIds.join(',')}`);
  };

  const getSearchSummary = () => {
    const cityParam = searchParams.get('city');
    const dateParam = searchParams.get('availabilityDate');
    const eventParam = searchParams.get('eventType');
    
    let parts = [];
    if (cityParam) {
      parts.push(`in ${cityParam}`);
    }
    if (eventParam) {
      parts.push(`for ${eventParam}`);
    }
    if (dateParam) {
      parts.push(`on ${new Date(dateParam).toLocaleDateString()}`);
    }

    if (parts.length > 0) {
      return `Venues ${parts.join(' ')}`;
    }
    return 'Discover Event Venues';
  };

  const getSubSummary = () => {
    const cityParam = searchParams.get('city');
    if (cityParam) {
      return `Showing ${halls.length} verified venue${halls.length !== 1 ? 's' : ''} available in ${cityParam}`;
    }
    return `Showing ${halls.length} verified venue${halls.length !== 1 ? 's' : ''} across India`;
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header / Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">{getSearchSummary()}</h1>
          <p className="text-sm text-slate-500 mt-1">{getSubSummary()}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <div className="hidden sm:flex border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setViewMode('split')}
              className={`p-2.5 flex items-center space-x-1.5 text-xs font-semibold ${viewMode === 'split' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <MapIcon className="h-4 w-4" />
              <span>Map Split</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 flex items-center space-x-1.5 text-xs font-semibold ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Grid className="h-4 w-4" />
              <span>Grid Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out/Toggleable Filters drawer */}
      {showFilters && (
        <form onSubmit={applyFilters} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-200">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase pl-1">City</label>
            <input
              type="text"
              placeholder="e.g. Bangalore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm text-slate-800 mt-1 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase pl-1">Area / Local Neighborhood</label>
            <input
              type="text"
              placeholder="e.g. Indiranagar"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm text-slate-800 mt-1 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase pl-1">Min Price (₹)</label>
            <input
              type="number"
              placeholder="Min budget"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm text-slate-800 mt-1 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase pl-1">Max Price (₹)</label>
            <input
              type="number"
              placeholder="Max budget"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm text-slate-800 mt-1 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase pl-1">Min Capacity (Guests)</label>
            <input
              type="number"
              placeholder="Guests"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm text-slate-800 mt-1 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase pl-1">Air Conditioning</label>
            <select
              value={isAC}
              onChange={(e) => setIsAC(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm text-slate-800 mt-1 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
            >
              <option value="">Any</option>
              <option value="true">AC Hall</option>
              <option value="false">Non-AC Hall</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase pl-1">Parking Available</label>
            <select
              value={hasParking}
              onChange={(e) => setHasParking(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm text-slate-800 mt-1 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
            >
              <option value="">Any</option>
              <option value="true">Yes, with Parking</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase pl-1">Available Date</label>
            <input
              type="date"
              value={availabilityDate}
              onChange={(e) => setAvailabilityDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm text-slate-800 mt-1 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
            />
          </div>
          <div className="sm:col-span-2 md:col-span-4 flex items-center justify-end space-x-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={clearFilters} className="text-slate-500 hover:text-slate-800 font-semibold text-sm px-4 py-2">
              Clear All
            </button>
            <button type="submit" className="bg-slate-900 text-white rounded-xl py-2 px-6 font-semibold hover:bg-slate-800 text-sm shadow-md">
              Apply Filters
            </button>
          </div>
        </form>
      )}

      {/* Main Split Screen Area */}
      <div className={`grid grid-cols-1 ${viewMode === 'split' ? 'lg:grid-cols-5' : 'grid-cols-1'} gap-8`}>
        {/* Left Side: Halls Grid */}
        <div className={`${viewMode === 'split' ? 'lg:col-span-3' : 'w-full'} space-y-6`}>
          {isNearby && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start space-x-3 text-xs text-amber-800 shadow-sm animate-in fade-in duration-200">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900 text-sm">No halls available in "{searchedCity || searchParams.get('city')}"</p>
                <p className="mt-0.5 leading-normal">
                  No function halls are available in your selected location. Here are the nearest available halls.
                </p>
              </div>
            </div>
          )}

          {halls.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
              <SlidersHorizontal className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-slate-800 font-bold text-lg">No Venues Found</h3>
              <p className="text-sm mt-1">Try clearing some search filters or changing locations</p>
              <button onClick={clearFilters} className="mt-4 bg-slate-900 text-white font-semibold rounded-full py-2 px-6 text-xs hover:bg-slate-800 shadow-md">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${viewMode === 'split' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3'} gap-6`}>
              {halls.map((hall) => (
                <div
                  key={hall._id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all hover:scale-[1.01]"
                >
                  {/* Select for Compare */}
                  <div className="absolute right-3 top-3 z-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCompareToggle(hall._id); }}
                      className={`flex h-8 items-center space-x-1 px-2.5 rounded-full backdrop-blur-sm text-[10px] font-bold shadow-sm transition-all border ${compareIds.includes(hall._id) ? 'bg-brand-500 text-white border-brand-500' : 'bg-white/95 text-slate-600 border-slate-200/50 hover:bg-white'}`}
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>{compareIds.includes(hall._id) ? 'Selected' : 'Compare'}</span>
                    </button>
                  </div>

                  <div className="cursor-pointer" onClick={() => navigate(`/halls/${hall._id}`)}>
                    <div className="relative aspect-video overflow-hidden">
                      {/* Distance overlay badge */}
                      {hall.distance !== undefined && (
                        <div className="absolute left-3 top-3 z-20 flex items-center space-x-1 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                          <MapPin className="h-3 w-3 text-brand-400" />
                          <span>{hall.distance} km ({hall.travelTime})</span>
                        </div>
                      )}
                      <img
                        src={getPrimaryHallPhoto(hall)}
                        alt={hall.name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-brand-600 transition-colors">{hall.name}</h3>
                        <div className="flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{hall.rating || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-slate-400 space-x-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="line-clamp-1">{hall.area}, {hall.city}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] bg-slate-50 border border-slate-100 rounded-md py-0.5 px-2 text-slate-600 font-medium">Seating: {hall.capacity}</span>
                        {hall.isAC && <span className="text-[10px] bg-blue-50 border border-blue-100 rounded-md py-0.5 px-2 text-blue-600 font-medium">AC</span>}
                        {hall.parkingCapacity > 0 && <span className="text-[10px] bg-green-50 border border-green-100 rounded-md py-0.5 px-2 text-green-600 font-medium">Parking</span>}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-slate-50 flex items-center justify-between text-xs cursor-pointer" onClick={() => navigate(`/halls/${hall._id}`)}>
                    <span className="text-slate-400">Rooms: <b className="text-slate-700">{hall.roomsCount} suites</b></span>
                    <span className="text-brand-600 font-bold text-sm">₹{hall.basePrice?.toLocaleString()}<span className="text-[10px] text-slate-400 font-normal"> /day</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Leaflet Map Container */}
        {viewMode === 'split' && (
          <div className="hidden lg:block lg:col-span-2 h-[calc(100vh-12rem)] sticky top-24 rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
            <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ChangeMapView center={mapCenter} />
              {halls.map((hall) => {
                const coords = hall.coordinates || { lat: 12.9716, lng: 77.5946 };
                return (
                  <Marker key={hall._id} position={[coords.lat, coords.lng]}>
                    <Popup>
                      <div className="p-1 space-y-2 max-w-xs text-xs">
                        <img src={hall.photos?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=300'} alt={hall.name} className="w-full aspect-video object-cover rounded-lg" />
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{hall.name}</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-brand-600 font-bold">₹{hall.basePrice?.toLocaleString()}/day</span>
                          <button
                            onClick={() => navigate(`/halls/${hall._id}`)}
                            className="bg-slate-900 text-white text-[10px] font-bold rounded-lg py-1 px-3"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}
      </div>

      {/* Floating Compare Desk Overlay */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white py-4 px-6 rounded-2xl shadow-2xl flex items-center space-x-6 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="h-5 w-5 text-brand-400" />
            <span className="text-sm font-semibold">{compareIds.length} hall{compareIds.length > 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setCompareIds([])} className="text-xs text-slate-400 hover:text-white font-medium">
              Clear
            </button>
            <button
              onClick={startComparison}
              disabled={compareIds.length < 2}
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl py-2 px-5 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
