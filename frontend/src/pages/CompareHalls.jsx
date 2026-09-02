import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Check, X, ArrowLeft, Building, Trash2 } from 'lucide-react';
import axios from 'axios';
import { getPrimaryHallPhoto } from '../utils/getHallImages';

export default function CompareHalls() {
  const [searchParams] = useSearchParams();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const ids = searchParams.get('ids') ? searchParams.get('ids').split(',') : [];

  const getFallbackHallsList = () => {
    return [
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
        amenities: ['Central Air Conditioning', 'Valet Parking', 'Bridal Suites', 'Stage Lighting', 'Kitchen Area', 'CCTV Security'],
        photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600'],
        basePrice: 150000,
        rating: 4.8
      },
      {
        _id: 'fb_hall_2',
        name: 'Tulip Celebration Banquet',
        description: 'A cozy yet fully-equipped elegant banquet hall, perfect for corporate meetings and family functions.',
        address: '80 Feet Road, HAL Stage 2',
        city: 'Bangalore',
        area: 'Indiranagar',
        coordinates: { lat: 12.9649, lng: 77.6394 },
        capacity: 350,
        diningCapacity: 150,
        parkingCapacity: 30,
        isAC: true,
        roomsCount: 4,
        amenities: ['Central Air Conditioning', 'Basic AV Setup', 'Valet Parking', 'Generator Backup'],
        photos: ['https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=600'],
        basePrice: 45000,
        rating: 4.5
      },
      {
        _id: 'fb_hall_3',
        name: 'Royal Orchid Gardens',
        description: 'Sprawling outdoor green lawns combined with an air-conditioned luxury glass-domed banquet.',
        address: 'ECC Road, near ITPL',
        city: 'Bangalore',
        area: 'Whitefield',
        coordinates: { lat: 12.9698, lng: 77.7499 },
        capacity: 2000,
        diningCapacity: 1000,
        parkingCapacity: 500,
        isAC: true,
        roomsCount: 20,
        amenities: ['Central AC', 'Lawn Seating', 'Infinity Pool view', 'Helipad Access'],
        photos: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600'],
        basePrice: 220000,
        rating: 4.9
      },
      {
        _id: 'fb_hall_4',
        name: 'Silicon Valley Banquet Hall',
        description: 'Cozy and modern business-friendly banquet hall, highly popular for product launches and tech meetups.',
        address: '100 Feet Road, Koramangala 4th Block',
        city: 'Bangalore',
        area: 'Koramangala',
        coordinates: { lat: 12.9352, lng: 77.6245 },
        capacity: 200,
        diningCapacity: 100,
        parkingCapacity: 15,
        isAC: true,
        roomsCount: 2,
        amenities: ['Projector System', 'Wi-Fi Access', 'Central AC', 'Sound System'],
        photos: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600'],
        basePrice: 30000,
        rating: 4.2
      },
      {
        _id: 'fb_hall_5',
        name: 'Bandra Heights Grand Ballroom',
        description: 'Bandra Heights Grand Ballroom offers unmatched luxury and sweeping coastal breezes.',
        address: 'Linking Road Extension, Bandra West',
        city: 'Mumbai',
        area: 'Bandra West',
        coordinates: { lat: 19.0544, lng: 72.8402 },
        capacity: 800,
        diningCapacity: 400,
        parkingCapacity: 100,
        isAC: true,
        roomsCount: 8,
        amenities: ['Central AC', 'Sea view deck', 'Infinity pool background', 'VIP Lounges'],
        photos: ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600'],
        basePrice: 220000,
        rating: 4.9
      },
      {
        _id: 'fb_hall_6',
        name: 'Marine Drive Ocean View Banquet',
        description: 'Exquisite boutique banquet hall right on Marine Drive overlooking the Arabian Sea.',
        address: 'Netaji Subhash Chandra Bose Road',
        city: 'Mumbai',
        area: 'Marine Drive',
        coordinates: { lat: 18.9431, lng: 72.8230 },
        capacity: 500,
        diningCapacity: 250,
        parkingCapacity: 40,
        isAC: true,
        roomsCount: 6,
        amenities: ['Central AC', 'Sea Facing Views', 'Valet Parking', 'Lounge Seating'],
        photos: ['https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=600'],
        basePrice: 180000,
        rating: 4.7
      },
      {
        _id: 'fb_hall_7',
        name: 'Juhu Residency Celebration Hall',
        description: 'A beautiful beachside destination vibe right in the middle of Mumbai near Juhu beach.',
        address: 'Juhu Tara Road, near beach access',
        city: 'Mumbai',
        area: 'Juhu',
        coordinates: { lat: 19.1026, lng: 72.8270 },
        capacity: 400,
        diningCapacity: 200,
        parkingCapacity: 25,
        isAC: true,
        roomsCount: 5,
        amenities: ['AC Hall', 'Juhu Beach access', 'Lawn deck', 'Bridal room'],
        photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600'],
        basePrice: 90000,
        rating: 4.4
      },
      {
        _id: 'fb_hall_8',
        name: 'Gateway Celebration Plaza',
        description: 'Immaculately restored historic-themed ballroom situated near the Gateway of India.',
        address: 'Apollo Bunder, Colaba',
        city: 'Mumbai',
        area: 'Colaba',
        coordinates: { lat: 18.9220, lng: 72.8347 },
        capacity: 1200,
        diningCapacity: 600,
        parkingCapacity: 150,
        isAC: true,
        roomsCount: 15,
        amenities: ['Central AC', 'Historic Decor', 'Valet Parking', 'Luxury Suites'],
        photos: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600'],
        basePrice: 250000,
        rating: 4.8
      },
      {
        _id: 'fb_hall_9',
        name: 'OMR Tech Park Convention Center',
        description: 'A modern, high-tech convention center optimized for corporate trade fairs and IT events.',
        address: 'OMR Expressway, near Sholinganallur',
        city: 'Chennai',
        area: 'OMR',
        coordinates: { lat: 12.9654, lng: 80.2462 },
        capacity: 1000,
        diningCapacity: 500,
        parkingCapacity: 200,
        isAC: true,
        roomsCount: 10,
        amenities: ['Gigabit Wi-Fi', 'AC Halls', 'Projector arrays', 'Executive Lounges'],
        photos: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600'],
        basePrice: 110000,
        rating: 4.6
      },
      {
        _id: 'fb_hall_10',
        name: 'Marina Beach Banquet Hall',
        description: 'Traditional and historic boutique banquet hall in Mylapore, perfect for naming ceremonies.',
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
        description: 'Premium seaside resort lawn and beach view convention deck on the Bay of Bengal ECR.',
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
        description: 'Located in the heart of T-Nagar shopping hub. Features Dravidian pillar details and AC halls.',
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
  };

  useEffect(() => {
    if (ids.length > 0) {
      if (ids.some(id => id.startsWith('fb_hall_'))) {
        const fallbacks = getFallbackHallsList();
        const matches = fallbacks.filter(h => ids.includes(h._id));
        setHalls(matches);
        setLoading(false);
        return;
      }

      axios.get(`/wishlist/compare?ids=${ids.join(',')}`)
        .then(res => setHalls(res.data.data))
        .catch(err => {
          console.error('Error loading compare details from server, doing local fallback:', err);
          const fallbacks = getFallbackHallsList();
          const matches = fallbacks.filter(h => ids.includes(h._id));
          setHalls(matches.length > 0 ? matches : fallbacks.slice(0, 2));
        })
        .finally(() => setLoading(false));
    } else {
      setHalls([]);
      setLoading(false);
    }
  }, [searchParams]);

  const removeCompareItem = (id) => {
    const updatedIds = ids.filter(x => x !== id);
    if (updatedIds.length === 0) {
      navigate('/halls');
    } else {
      navigate(`/compare?ids=${updatedIds.join(',')}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-brand-500"></div>
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="mx-auto max-w-md text-center py-20 space-y-4">
        <Building className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800">No venues selected to compare</h2>
        <p className="text-sm text-slate-500">Select halls from the discover search listings to compare side-by-side.</p>
        <button onClick={() => navigate('/halls')} className="bg-slate-900 text-white font-semibold rounded-full py-2 px-6 text-xs hover:bg-slate-800 shadow-md">
          Search Halls
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Compare Venues</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {halls.map((hall) => (
          <div key={hall._id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-5 relative group">
            {/* Remove item */}
            <button
              onClick={() => removeCompareItem(hall._id)}
              className="absolute right-4 top-4 z-20 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-red-500 transition-colors shadow-sm"
              title="Remove comparison"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Photo & Title */}
            <div className="space-y-3 cursor-pointer" onClick={() => navigate(`/halls/${hall._id}`)}>
              <div className="aspect-video rounded-2xl overflow-hidden relative">
                <img src={getPrimaryHallPhoto(hall)} alt={hall.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 hover:text-brand-600 transition-colors line-clamp-1">{hall.name}</h3>
                <div className="flex items-center text-xs text-slate-400 space-x-1 mt-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span>{hall.area}, {hall.city}</span>
                </div>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="border-t border-slate-100 pt-4 space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Base Price / day</span>
                <span className="font-extrabold text-brand-600 text-sm">₹{hall.basePrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Seating Capacity</span>
                <span className="font-semibold text-slate-800">{hall.capacity} Guests</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Dining Capacity</span>
                <span className="font-semibold text-slate-800">{hall.diningCapacity} Guests</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Air Conditioning</span>
                <span className="font-semibold text-slate-800">{hall.isAC ? 'AC Hall' : 'Non-AC'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Guest Suites / Rooms</span>
                <span className="font-semibold text-slate-800">{hall.roomsCount} Rooms</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Parking Space</span>
                <span className="font-semibold text-slate-800">{hall.parkingCapacity || 0} Cars</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Average Rating</span>
                <div className="flex items-center space-x-1 font-bold text-slate-800">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{hall.rating || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Amenities breakdown */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Amenities Include</span>
              <div className="flex flex-wrap gap-1">
                {hall.amenities.slice(0, 4).map((a, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-50 border border-slate-100 rounded-md py-0.5 px-2 text-slate-600 font-medium">
                    {a}
                  </span>
                ))}
                {hall.amenities.length > 4 && (
                  <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5">+ {hall.amenities.length - 4} more</span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2">
              <button
                onClick={() => navigate(`/halls/${hall._id}`)}
                className="w-full bg-slate-900 text-white font-semibold rounded-xl py-2.5 text-xs hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center space-x-2"
              >
                <span>View Details & Plan</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
