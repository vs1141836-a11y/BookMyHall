import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, PartyPopper, Heart, MapPin, Star, Building2, ShieldCheck, Gem, Sparkles, Cake, Baby, Home as HomeIcon, Gift, Briefcase, LogOut, Sun, Music } from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [eventTypes, setEventTypes] = useState([]);
  const [featuredHalls, setFeaturedHalls] = useState([]);
  const navigate = useNavigate();

  const fallbackCategories = [
    { name: 'Marriage', description: 'Traditional and grand Indian weddings.' },
    { name: 'Reception', description: 'Post-wedding receptions and banquets.' },
    { name: 'Engagement', description: 'Ring ceremony celebrations.' },
    { name: 'Birthday', description: 'Fun birthday parties and cakes.' },
    { name: 'Baby Shower', description: 'Traditional baby shower cradle events.' },
    { name: 'Naming Ceremony', description: 'Newborn child naming celebrations.' },
    { name: 'Housewarming', description: 'New house Griha Pravesh pooja functions.' },
    { name: 'Anniversary', description: 'Marriage anniversary celebrations.' },
    { name: 'Corporate Events', description: 'Professional conventions and meets.' },
    { name: 'Farewell', description: 'Send-off social banquet gatherings.' },
    { name: 'Retirement', description: 'Retirement felicitation ceremonies.' },
    { name: 'Cultural Programs', description: 'Dance, music, and stage events.' },
    { name: 'Festival Celebrations', description: 'Traditional seasonal festival functions.' },
    { name: 'Family Functions', description: 'Relative dinners and social get-togethers.' }
  ];

  const getEventIcon = (name) => {
    const clean = name.toLowerCase();
    if (clean.includes('marriage') || clean.includes('wedding')) return <Heart className="h-6 w-6" />;
    if (clean.includes('reception')) return <Sparkles className="h-6 w-6" />;
    if (clean.includes('engagement')) return <Gem className="h-6 w-6" />;
    if (clean.includes('birthday')) return <Cake className="h-6 w-6" />;
    if (clean.includes('baby')) return <Baby className="h-6 w-6" />;
    if (clean.includes('naming')) return <Sparkles className="h-6 w-6" />;
    if (clean.includes('housewarming') || clean.includes('griha')) return <HomeIcon className="h-6 w-6" />;
    if (clean.includes('anniversary')) return <Gift className="h-6 w-6" />;
    if (clean.includes('corporate') || clean.includes('business')) return <Briefcase className="h-6 w-6" />;
    if (clean.includes('farewell')) return <LogOut className="h-6 w-6" />;
    if (clean.includes('retirement')) return <Sun className="h-6 w-6" />;
    if (clean.includes('cultural') || clean.includes('music') || clean.includes('dance')) return <Music className="h-6 w-6" />;
    if (clean.includes('festival') || clean.includes('seasonal')) return <Sparkles className="h-6 w-6" />;
    if (clean.includes('family') || clean.includes('get-together')) return <Users className="h-6 w-6" />;
    return <PartyPopper className="h-6 w-6" />;
  };

  const displayedEventTypes = eventTypes.length > 0 ? eventTypes : fallbackCategories;

  useEffect(() => {
    // Fetch categories/event types
    axios.get('/event-types')
      .then(res => setEventTypes(res.data.data))
      .catch(err => console.error(err));

    // Fetch top 3 featured halls
    axios.get('/halls')
      .then(res => {
        const sorted = res.data.data.sort((a, b) => b.rating - a.rating);
        setFeaturedHalls(sorted.slice(0, 3));
      })
      .catch(err => console.error(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (city) query.append('city', city);
    if (date) query.append('availabilityDate', date);
    if (eventType) query.append('eventType', eventType);
    if (capacity) query.append('capacity', capacity);
    navigate(`/halls?${query.toString()}`);
  };

  const selectCategory = (name) => {
    navigate(`/halls?eventType=${name}`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <div className="relative bg-slate-900 py-24 sm:py-32 overflow-hidden">
        {/* Background Image with opacity */}
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1920')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400 ring-1 ring-inset ring-brand-500/20">
              India's #1 Event Venue Platform
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Discover & Plan <br className="hidden sm:inline" /> Your Perfect Event
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              Discover verified function halls, customize decorations & catering packages, compare prices, and book instantly.
            </p>
          </div>

          {/* Premium Search Desk */}
          <form onSubmit={handleSearch} className="mx-auto max-w-4xl rounded-2xl bg-white p-4 shadow-2xl md:flex md:space-x-4 md:items-center space-y-4 md:space-y-0 text-left">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">City / Location</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Bangalore, Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="w-full md:w-44">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Event Date</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Event Category</label>
              <div className="relative mt-1">
                <PartyPopper className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white appearance-none"
                >
                  <option value="">Select Category</option>
                  {displayedEventTypes.map((type) => (
                    <option key={type._id || type.name} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full md:w-36">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Guests</label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  placeholder="Min Guests"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl py-3 px-6 text-sm font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Categories / Event Types Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Browse by Event Type</h2>
          <p className="text-sm text-slate-500 mt-1">Discover customized venue configurations tailored for every major Indian celebration</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayedEventTypes.map((type) => (
            <div
              key={type._id || type.name}
              onClick={() => selectCategory(type.name)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-brand-100 cursor-pointer transition-all hover:scale-[1.02] text-center space-y-3 group"
            >
              <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                {getEventIcon(type.name)}
              </div>
              <span className="font-semibold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">{type.name}</span>
              <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{type.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-slate-100/50 py-16 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Why BookMyHall?</h2>
            <p className="text-sm text-slate-500 leading-relaxed">Planning an event should be joyous, not stressful. We bring transparency and end-to-end customization to your screen.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="h-10 w-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-800">100% Verified Venues</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Every hall listed undergoes a strict review check of license certificates, capacities, and amenities by our admin team.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="h-10 w-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600">
                <Gem className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-800">Dynamic Packages</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Customize food menus, stage decorations, and AV details on our real-time customizer drawer, getting live price calculations.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="h-10 w-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-800">SaaS Dashboards</h3>
              <p className="text-sm text-slate-500 leading-relaxed">From single-screen venue lists to complete owner booking timelines and calendar schedulers, manage everything on one cloud platform.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Halls Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Popular Halls in India</h2>
            <p className="text-sm text-slate-500 mt-1">Explore our highly-rated venue listings</p>
          </div>
          <button onClick={() => navigate('/halls')} className="text-sm font-semibold text-brand-500 hover:text-brand-600">
            View All &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredHalls.map((hall) => (
            <div
              key={hall._id}
              onClick={() => navigate(`/halls/${hall._id}`)}
              className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={hall.photos?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600'}
                  alt={hall.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute left-3 top-3 bg-white/95 backdrop-blur-sm rounded-full py-1 px-2.5 text-[10px] font-bold text-slate-800 shadow-sm capitalize">
                  {hall.city}
                </span>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-brand-600 transition-colors">{hall.name}</h3>
                  <div className="flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{hall.rating || 'N/A'}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{hall.description}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-xs">
                  <span className="text-slate-400">Capacity: <b className="text-slate-700">{hall.capacity} Pax</b></span>
                  <span className="text-brand-600 font-bold text-sm">₹{hall.basePrice?.toLocaleString()}<span className="text-[10px] text-slate-400 font-normal"> /day</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Owner CTA Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-slate-900 py-16 px-8 sm:px-16 overflow-hidden shadow-xl text-center space-y-6">
          <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=1200')" }}></div>
          <div className="relative max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">List Your Venue on BookMyHall</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you a banquet hall or convention center owner? Partner with us to showcase your venue, manage bookings, integrate custom packages, and get direct digital leads across India.
            </p>
            <button
              onClick={() => navigate('/register?role=owner')}
              className="inline-flex items-center bg-white text-slate-900 font-semibold rounded-full py-3 px-8 text-sm hover:bg-slate-100 transition-colors shadow-md shadow-black/10 active:scale-[0.98]"
            >
              Get Started as Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
