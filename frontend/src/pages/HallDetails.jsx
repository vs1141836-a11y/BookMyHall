import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Users, Calendar, Sparkles, AlertCircle, Heart, Star, CheckCircle, ShieldAlert, BadgeInfo } from 'lucide-react';
import axios from 'axios';
import { getDynamicVenueImages } from '../utils/getHallImages';

const FOOD_PACKAGES = [
  { id: 'veg_basic', name: 'Veg Basic Buffet', description: 'Delicious standard vegetarian menu featuring 2 starters, main curries, dal, rice, and hot gulab jamun.', price: 300, isPerPerson: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600', category: 'Veg' },
  { id: 'veg_premium', name: 'Veg Premium Buffet', description: 'Lavish vegetarian wedding buffet with live tandoor counter, multi-cuisine starters, premium paneer items, and dessert bar.', price: 500, isPerPerson: true, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600', category: 'Veg' },
  { id: 'nonveg_standard', name: 'Non-Veg Standard Buffet', description: 'Classic buffet featuring chicken starters, mutton biryani, standard veg accompaniments, and desserts.', price: 650, isPerPerson: true, image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=600', category: 'Non-Veg' },
  { id: 'nonveg_deluxe', name: 'Non-Veg Deluxe Buffet', description: 'Grand wedding non-veg feast with fish, chicken, mutton seekh kebabs, premium biryanis, and live sweet counters.', price: 900, isPerPerson: true, image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600', category: 'Non-Veg' },
  { id: 'welcome_drinks', name: 'Welcome Drinks Counter', description: 'Chilled fruit juices, fresh mocktails, coconut water, and signature welcome drinks for arriving guests.', price: 5000, isPerPerson: false, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600', category: 'Additional Service' },
  { id: 'ice_cream', name: 'Live Ice Cream Counter', description: 'Ice cream counter featuring diverse flavors (vanilla, chocolate, mango) with various toppings and waffle cones.', price: 6000, isPerPerson: false, image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&q=80&w=600', category: 'Additional Service' },
  { id: 'sweets', name: 'Indian Sweet Counter', description: 'Assorted warm traditional Indian sweets including jalebi, rabri, kaju katli, rasgulla, and fresh rasmalai.', price: 8000, isPerPerson: false, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600', category: 'Additional Service' },
  { id: 'live_food', name: 'Live Dosa/Chaat Counter', description: 'Interactive live counter preparing fresh paper dosas, masala dosas, and street-style papdi chaat.', price: 15000, isPerPerson: false, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600', category: 'Additional Service' }
];

const DECORATION_PACKAGES = [
  { id: 'decor_basic', name: 'Basic Decoration', description: 'Simple stage draping, entrance gate balloons, basic background lighting, and standard seating layout.', price: 20000, image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600', category: 'Decoration' },
  { id: 'decor_premium', name: 'Premium Floral Decoration', description: 'Stunning fresh rose & orchid stage arches, thematic flower pathway walkway, entrance styling, and backdrop lights.', price: 50000, image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600', category: 'Decoration' },
  { id: 'decor_luxury', name: 'Luxury Theme Decoration', description: 'Breathtaking royal palace setups with grand crystal chandeliers, luxury walkthrough tunnels, velvet fabrics, and premium floral arches.', price: 120000, image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600', category: 'Decoration' },
  { id: 'stage_decor', name: 'Stage Decoration', description: 'Exclusive centerpiece staging arrangement with custom color spotlights and fresh flower borders.', price: 15000, image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=600', category: 'Decoration Add-on' },
  { id: 'led_lighting', name: 'Event LED Lighting', description: 'High-end ambient room lighting, smart wash lights, truss stage lights, and customized color themes.', price: 10000, image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=600', category: 'Decoration Add-on' },
  { id: 'balloon_decor', name: 'Balloon Decoration', description: 'Over 1000 color-coordinated theme balloons, pillars, ceiling arches, and party poppers for celebrations.', price: 8000, image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=600', category: 'Decoration Add-on' },
  { id: 'entrance_arch', name: 'Entrance Flower Arch', description: 'Welcoming floral tunnel at the main gate using fresh jasmine, marigold, and roses.', price: 7000, image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600', category: 'Decoration Add-on' }
];



export default function HallDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Venue details states
  const [hall, setHall] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Curated photos list
  const photos = getDynamicVenueImages(hall);

  // Lightbox States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setZoomScale(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoomScale(1);
  };

  const nextImage = () => {
    setZoomScale(1);
    setLightboxIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    setZoomScale(1);
    setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const zoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
  };

  const resetZoom = () => {
    setZoomScale(1);
  };

  // Keyboard Event Listeners for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, photos.length]);

  // Customizer / Scheduling States
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [eventTypes, setEventTypes] = useState([]);
  const [chosenEvent, setChosenEvent] = useState(null);
  const [selectedFoodPackages, setSelectedFoodPackages] = useState(['veg_basic']);
  const [selectedDecorations, setSelectedDecorations] = useState(['decor_basic']);
  const [guestsCount, setGuestsCount] = useState(100);
  const [customServices, setCustomServices] = useState([]);
  const [packageTier, setPackageTier] = useState('bronze');

  const toggleFoodPackage = (pkgId) => {
    setSelectedFoodPackages(prev => {
      const clickedPkg = FOOD_PACKAGES.find(p => p.id === pkgId);
      if (clickedPkg && clickedPkg.isPerPerson) {
        const filtered = prev.filter(id => {
          const item = FOOD_PACKAGES.find(p => p.id === id);
          return !item || !item.isPerPerson;
        });
        if (prev.includes(pkgId)) {
          return filtered;
        } else {
          return [...filtered, pkgId];
        }
      }
      if (prev.includes(pkgId)) {
        return prev.filter(x => x !== pkgId);
      }
      return [...prev, pkgId];
    });
  };

  const toggleDecoration = (pkgId) => {
    setSelectedDecorations(prev => {
      const clickedPkg = DECORATION_PACKAGES.find(p => p.id === pkgId);
      if (clickedPkg && clickedPkg.category === 'Decoration') {
        const filtered = prev.filter(id => {
          const item = DECORATION_PACKAGES.find(p => p.id === id);
          return !item || item.category !== 'Decoration';
        });
        if (prev.includes(pkgId)) {
          return filtered;
        } else {
          return [...filtered, pkgId];
        }
      }
      if (prev.includes(pkgId)) {
        return prev.filter(x => x !== pkgId);
      }
      return [...prev, pkgId];
    });
  };

  // Wishlist toggle
  const [isInWishlist, setIsInWishlist] = useState(false);

  // General UI states
  const [viewing360, setViewing360] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 360 virtual tour initialization using WebGL-accelerated Pannellum
  useEffect(() => {
    if (!viewing360 || !hall) return;

    let viewerInstance = null;
    
    // Check if stylesheet is already in document
    let link = document.querySelector('link[href*="pannellum.css"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);
    }
    
    const initViewer = () => {
      if (window.pannellum) {
        try {
          viewerInstance = window.pannellum.viewer('panorama-container', {
            type: 'equirectangular',
            panorama: hall.panoramaUrl || '/hall_panorama.jpg',
            autoLoad: true,
            showControls: true,
            yaw: 0,
            pitch: 0,
            hfov: 100
          });
        } catch (e) {
          console.error('Failed to initialize Pannellum:', e);
        }
      }
    };

    if (window.pannellum) {
      const timer = setTimeout(initViewer, 100);
      return () => {
        clearTimeout(timer);
        if (viewerInstance) {
          viewerInstance.destroy();
        }
      };
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.async = true;
      script.onload = () => {
        initViewer();
      };
      document.body.appendChild(script);

      return () => {
        if (viewerInstance) {
          viewerInstance.destroy();
        }
      };
    }
  }, [viewing360, hall]);

  // Complaint / Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportIssueType, setReportIssueType] = useState('Fake listing');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    fetchHallDetails();
    fetchEventTypes();
    if (isAuthenticated) {
      checkWishlistStatus();
    }
  }, [id, isAuthenticated]);

  const getFallbackHallsList = () => {
    return [
      {
        _id: 'fb_hall_1',
        name: 'Grand Palace Convention Center',
        panoramaUrl: '/hall_panorama.jpg',
        description: 'Experience majestic grandeur at our flagship luxury palace convention center. Suitable for ultra-premium weddings, cultural events, and high-profile exhibitions. Featuring expansive lawns, crystal chandeliers, a grand dining area, and multiple luxury suites for guests.',
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
        rules: ['No loud music after 10 PM', 'Outside catering allowed with prior permit', 'Alcohol not allowed without licensing'],
        cancellationPolicy: 'Full refund for cancellations made 45 days prior to event. 50% refund between 45 to 15 days.',
        photos: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 150000,
        rating: 4.8
      },
      {
        _id: 'fb_hall_2',
        name: 'Tulip Celebration Banquet',
        panoramaUrl: '/hall_panorama.jpg',
        description: 'A cozy yet fully-equipped elegant banquet hall, perfect for corporate meetings, birthday celebrations, baby showers, naming ceremonies, and private family dinners.',
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
        rules: ['No firecrackers inside banquet premises', 'Decoration vendor must use pre-approved tape'],
        cancellationPolicy: 'Refund allowed only if cancelled 30 days prior.',
        photos: [
          'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 45000,
        rating: 4.5
      },
      {
        _id: 'fb_hall_3',
        name: 'Royal Orchid Gardens',
        description: 'Sprawling outdoor green lawns combined with an air-conditioned luxury glass-domed banquet, ideal for grand starlight wedding receptions and music concerts.',
        address: 'ECC Road, near ITPL',
        city: 'Bangalore',
        area: 'Whitefield',
        coordinates: { lat: 12.9698, lng: 77.7499 },
        capacity: 2000,
        diningCapacity: 1000,
        parkingCapacity: 500,
        isAC: true,
        roomsCount: 20,
        amenities: ['Central AC', 'Lawn Seating', 'Infinity Pool view', 'Helipad Access', 'High Security'],
        rules: ['Loud music permitted on lawns until 11 PM', 'Eco-friendly disposables only'],
        cancellationPolicy: 'Rescheduling permitted once. No refund.',
        photos: [
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 220000,
        rating: 4.9
      },
      {
        _id: 'fb_hall_4',
        name: 'Silicon Valley Banquet Hall',
        description: 'Cozy and modern business-friendly banquet hall, highly popular for product launches, tech meetups, and formal corporate anniversary dinners.',
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
        rules: ['No outside food allowed', 'No loud music permitted'],
        cancellationPolicy: 'Fully refundable up to 15 days before the event.',
        photos: [
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 30000,
        rating: 4.2
      },
      {
        _id: 'fb_hall_5',
        name: 'Bandra Heights Grand Ballroom',
        description: 'Perched overlooking the Western Express Highway, Bandra Heights Grand Ballroom offers unmatched luxury and sweeping coastal breezes for Mumbai high society weddings and grand corporate conventions.',
        address: 'Linking Road Extension, Bandra West',
        city: 'Mumbai',
        area: 'Bandra West',
        coordinates: { lat: 19.0544, lng: 72.8402 },
        capacity: 800,
        diningCapacity: 400,
        parkingCapacity: 100,
        isAC: true,
        roomsCount: 8,
        amenities: ['Central AC', 'Sea view deck', 'Infinity pool background', 'VIP Lounges', 'State of the art sound system'],
        rules: ['No pets allowed', 'Eco-friendly disposables only'],
        cancellationPolicy: 'No refunds. Date rescheduling allowed once with 60 days advance request.',
        photos: [
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 220000,
        rating: 4.9
      },
      {
        _id: 'fb_hall_6',
        name: 'Marine Drive Ocean View Banquet',
        description: 'Exquisite boutique banquet hall right on Marine Drive. Features complete floor-to-ceiling glass windows overlooking the Arabian Sea, perfect for sunsets and high-profile cocktail dinners.',
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
        rules: ['No dj music past 10:30 PM', 'Traditional catering partners only'],
        cancellationPolicy: 'Refundable with 10% fee if cancelled 30 days prior.',
        photos: [
          'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'
        ],
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
        amenities: ['AC Hall', 'Juhu Beach access', 'Lawn deck', 'Bridal room'],
        rules: ['No firecrackers near beach sands', 'Outside caterers must present GST license'],
        cancellationPolicy: 'Rescheduling allowed up to 30 days prior.',
        photos: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'
        ],
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
        amenities: ['Central AC', 'Historic Decor', 'Valet Parking', 'Luxury Suites', 'Grand stage lights'],
        rules: ['No tape/nails allowed on wall panelings', 'Alcohol catering requires license and prior permit'],
        cancellationPolicy: 'Date transfer allowed once with 45 days advance notice.',
        photos: [
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200'
        ],
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
        amenities: ['Gigabit Wi-Fi', 'AC Halls', 'Projector arrays', 'Executive Lounges', 'Basement Parking'],
        rules: ['Sound system must be managed by in-house technicians', 'No smoking inside premises'],
        cancellationPolicy: 'Free cancellation up to 30 days before event date.',
        photos: [
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200'
        ],
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
        rules: ['Vegetarian catering only', 'No alcohol allowed inside Mylapore limits'],
        cancellationPolicy: 'Refundable with 15% cancellation fee.',
        photos: [
          'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=1200'
        ],
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
        photos: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'
        ],
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
        photos: [
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 85000,
        rating: 4.5
      }
    ];
  };

  const fetchHallDetails = async () => {
    if (id && id.startsWith('fb_hall_')) {
      const fallbackList = getFallbackHallsList();
      const found = fallbackList.find(h => h._id === id);
      if (found) {
        setHall(found);
        setBookedDates([]);
        setReviews([
          { _id: 'rev_1', customer: { name: 'Aarav Mehta' }, rating: 5, comment: 'Absolutely stunning venue! The service and staff hospitality were impeccable.' },
          { _id: 'rev_2', customer: { name: 'Priya Sharma' }, rating: 4, comment: 'Very spacious and clean. The food catering package we selected was delicious.' }
        ]);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.get(`/halls/${id}`);
      setHall(res.data.data);
      setBookedDates(res.data.bookedDates || []);
      
      // Fetch reviews
      const reviewsRes = await axios.get(`/reviews/hall/${id}`);
      setReviews(reviewsRes.data.data);
    } catch (err) {
      console.error('Error fetching details from server, attempting fallback:', err);
      const fallbackList = getFallbackHallsList();
      const found = fallbackList.find(h => h._id === id) || fallbackList[0];
      setHall(found);
      setBookedDates([]);
      setReviews([
        { _id: 'rev_1', customer: { name: 'Aarav Mehta' }, rating: 5, comment: 'Absolutely stunning venue! The service and staff hospitality were impeccable.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackEventTypes = () => {
    const dataMap = {
      'Marriage': [
        { name: 'Stage Decoration (Orchids & Roses)', category: 'Decoration', defaultPrice: 75000, isOptional: true, isCustomizable: true },
        { name: 'Welcome Flower Arch', category: 'Decoration', defaultPrice: 15000, isOptional: true, isCustomizable: true },
        { name: 'Traditional Catering (Veg - 500 plates)', category: 'Catering', defaultPrice: 150000, isOptional: false, isCustomizable: true },
        { name: 'Standard Photography & Videography', category: 'Photography', defaultPrice: 50000, isOptional: true, isCustomizable: true },
        { name: 'Wedding DJ with Sound Rig', category: 'DJ', defaultPrice: 25000, isOptional: true, isCustomizable: true }
      ],
      'Reception': [
        { name: 'Premium Stage Floral Arch & Lighting', category: 'Decoration', defaultPrice: 60000, isOptional: false, isCustomizable: true },
        { name: 'Buffet Catering (Mix Veg - 300 plates)', category: 'Catering', defaultPrice: 180000, isOptional: false, isCustomizable: true },
        { name: 'Reception DJ with Laser Show', category: 'DJ', defaultPrice: 30000, isOptional: true, isCustomizable: true },
        { name: 'Candid Photography & Highlights', category: 'Photography', defaultPrice: 45000, isOptional: true, isCustomizable: true }
      ],
      'Engagement': [
        { name: 'Elegant Floral Ring Stage Decor', category: 'Decoration', defaultPrice: 35000, isOptional: false, isCustomizable: true },
        { name: 'High Tea Snacks & Drinks (200 pax)', category: 'Catering', defaultPrice: 60000, isOptional: false, isCustomizable: true },
        { name: 'Engagement Photography', category: 'Photography', defaultPrice: 20000, isOptional: true, isCustomizable: true }
      ],
      'Birthday': [
        { name: 'Theme Balloon Decor (Standard)', category: 'Decoration', defaultPrice: 15000, isOptional: false, isCustomizable: true },
        { name: 'Premium Theme Stage Setup', category: 'Decoration', defaultPrice: 30000, isOptional: true, isCustomizable: true },
        { name: 'Kid-friendly Buffet (Veg - 100 plates)', category: 'Catering', defaultPrice: 35000, isOptional: false, isCustomizable: true },
        { name: 'Birthday Cake (2-Tier Designer)', category: 'Cake', defaultPrice: 5000, isOptional: true, isCustomizable: true },
        { name: 'Magic Show & Balloon Twisting (1 Hr)', category: 'Entertainment', defaultPrice: 8000, isOptional: true, isCustomizable: true }
      ],
      'Baby Shower': [
        { name: 'Traditional cradle & seating floral decor', category: 'Decoration', defaultPrice: 25000, isOptional: false, isCustomizable: true },
        { name: 'Traditional South Indian Veg Meal (200 plates)', category: 'Catering', defaultPrice: 70000, isOptional: false, isCustomizable: true },
        { name: 'Baby Shower Photographer', category: 'Photography', defaultPrice: 18000, isOptional: true, isCustomizable: true }
      ],
      'Naming Ceremony': [
        { name: 'Theme Cradle Flower Canopy', category: 'Decoration', defaultPrice: 20000, isOptional: false, isCustomizable: true },
        { name: 'Veg Lunch Buffet (250 plates)', category: 'Catering', defaultPrice: 85000, isOptional: false, isCustomizable: true },
        { name: 'Naming Ceremony Priest/Pooja Setup', category: 'Priest', defaultPrice: 7500, isOptional: true, isCustomizable: false }
      ],
      'Housewarming': [
        { name: 'Entrance door mango leaf & flower decor', category: 'Decoration', defaultPrice: 12000, isOptional: false, isCustomizable: true },
        { name: 'Satyanarayana Pooja Priest & materials', category: 'Priest', defaultPrice: 10000, isOptional: false, isCustomizable: false },
        { name: 'Traditional Veg Feast (150 plates)', category: 'Catering', defaultPrice: 55000, isOptional: false, isCustomizable: true },
        { name: 'Candid Housewarming Photography', category: 'Photography', defaultPrice: 15000, isOptional: true, isCustomizable: true }
      ],
      'Anniversary': [
        { name: 'Silver/Golden Stage Backdrop decoration', category: 'Decoration', defaultPrice: 25000, isOptional: false, isCustomizable: true },
        { name: 'Dinner Buffet (Veg/Non-Veg - 150 plates)', category: 'Catering', defaultPrice: 75000, isOptional: false, isCustomizable: true },
        { name: 'Designer Anniversary Cake', category: 'Cake', defaultPrice: 4000, isOptional: true, isCustomizable: true },
        { name: 'Live Acoustic Guitarist/Singer (2 Hrs)', category: 'Entertainment', defaultPrice: 12000, isOptional: true, isCustomizable: true }
      ],
      'Corporate Events': [
        { name: 'Projector & Dual Screens Setup', category: 'AV Equipment', defaultPrice: 8000, isOptional: false, isCustomizable: false },
        { name: 'Corporate Sound & Collar Mics', category: 'AV Equipment', defaultPrice: 5000, isOptional: false, isCustomizable: true },
        { name: 'Executive Buffet (150 Pax)', category: 'Catering', defaultPrice: 90000, isOptional: false, isCustomizable: true },
        { name: 'Corporate Host / Emcee', category: 'Entertainment', defaultPrice: 15000, isOptional: true, isCustomizable: true }
      ],
      'Farewell': [
        { name: 'Basic stage backdrop & banner print', category: 'Decoration', defaultPrice: 10000, isOptional: false, isCustomizable: true },
        { name: 'Snacks & Evening High Tea Buffet (200 pax)', category: 'Catering', defaultPrice: 50000, isOptional: false, isCustomizable: true },
        { name: 'Group Farewell Photography', category: 'Photography', defaultPrice: 12000, isOptional: true, isCustomizable: true }
      ],
      'Retirement': [
        { name: 'Traditional stage seating & floral design', category: 'Decoration', defaultPrice: 15000, isOptional: false, isCustomizable: true },
        { name: 'Dinner buffet (Veg - 150 plates)', category: 'Catering', defaultPrice: 52000, isOptional: false, isCustomizable: true },
        { name: 'Felicitation Shawl, Bouquet & Memento', category: 'Gifts', defaultPrice: 6000, isOptional: false, isCustomizable: false }
      ],
      'Cultural Programs': [
        { name: 'Stage Sound rigs & vocal microphones', category: 'AV Equipment', defaultPrice: 15000, isOptional: false, isCustomizable: true },
        { name: 'Stage LED color lights rig', category: 'AV Equipment', defaultPrice: 12000, isOptional: false, isCustomizable: true },
        { name: 'Catering snacks & refreshments (400 pax)', category: 'Catering', defaultPrice: 80000, isOptional: false, isCustomizable: true },
        { name: 'Full stage videography (Multi-cam)', category: 'Photography', defaultPrice: 30000, isOptional: true, isCustomizable: true }
      ],
      'Festival Celebrations': [
        { name: 'Grand festival entrance banana/mango leaf decor', category: 'Decoration', defaultPrice: 18000, isOptional: false, isCustomizable: true },
        { name: 'Festival Traditional Lunch Veg (300 plates)', category: 'Catering', defaultPrice: 105000, isOptional: false, isCustomizable: true },
        { name: 'Festival Pooja Priest & Materials', category: 'Priest', defaultPrice: 8500, isOptional: true, isCustomizable: false }
      ],
      'Family Functions': [
        { name: 'Standard stage backdrop decoration', category: 'Decoration', defaultPrice: 15000, isOptional: false, isCustomizable: true },
        { name: 'Standard Dinner Buffet (Veg - 200 plates)', category: 'Catering', defaultPrice: 70000, isOptional: false, isCustomizable: true },
        { name: 'Family Group Photography', category: 'Photography', defaultPrice: 15000, isOptional: true, isCustomizable: true }
      ]
    };

    const categories = Object.keys(dataMap);
    return categories.map((name, idx) => ({
      _id: `fallback_${idx}`,
      name,
      defaultServices: dataMap[name]
    }));
  };

  const fetchEventTypes = async () => {
    try {
      const res = await axios.get('/event-types');
      let data = res.data.data;
      if (!data || data.length === 0) {
        data = getFallbackEventTypes();
      }
      setEventTypes(data);
      if (data.length > 0) {
        selectEvent(data[0]);
      }
    } catch (err) {
      console.error('Error fetching event types, using fallback:', err);
      const fallback = getFallbackEventTypes();
      setEventTypes(fallback);
      if (fallback.length > 0) {
        selectEvent(fallback[0]);
      }
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const res = await axios.get('/wishlist');
      const found = res.data.data.some(h => h._id === id);
      setIsInWishlist(found);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await axios.post(`/wishlist/toggle/${id}`);
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      console.error(err);
    }
  };

  const selectEvent = (eventTypeObj) => {
    setChosenEvent(eventTypeObj);
    // Initialize custom services from the event type defaults
    const services = eventTypeObj.defaultServices.map(srv => ({
      name: srv.name,
      category: srv.category,
      price: srv.defaultPrice,
      isOptional: srv.isOptional,
      isCustomizable: srv.isCustomizable,
      quantity: 1,
      selected: !srv.isOptional // default selected if not optional
    }));
    setCustomServices(services);
    setPackageTier('custom');
  };

  const handleServiceToggle = (index) => {
    setCustomServices(prev => {
      const updated = [...prev];
      updated[index].selected = !updated[index].selected;
      return updated;
    });
    setPackageTier('custom');
  };

  const handleQuantityChange = (index, value) => {
    setCustomServices(prev => {
      const updated = [...prev];
      updated[index].quantity = Math.max(1, parseInt(value, 10) || 1);
      return updated;
    });
    setPackageTier('custom');
  };

  // Pre-configured package application
  const applyPackage = (tier) => {
    setPackageTier(tier);
    if (!chosenEvent) return;

    setCustomServices(prev => {
      return prev.map(srv => {
        let selected = srv.selected;
        let quantity = srv.quantity;

        if (tier === 'bronze') {
          // Select only mandatory/essential services, quantity = 1
          selected = !srv.isOptional;
          quantity = 1;
        } else if (tier === 'silver') {
          // Select mandatory + standard decoration, catering etc.
          selected = !srv.isOptional || srv.category === 'Decoration' || srv.category === 'Catering';
          quantity = 1;
        } else if (tier === 'gold') {
          // Select all default services
          selected = true;
          if (srv.name.includes('Veg')) {
            quantity = 2; // sample multiplier for grand scale
          }
        }
        return { ...srv, selected, quantity };
      });
    });
  };

  // Calculate live prices
  const calculateTotal = () => {
    if (!hall) return { hallRent: 0, foodCost: 0, decorationCost: 0, extraCharges: 0, subtotal: 0, gst: 0, grandTotal: 0, advance: 0, balance: 0 };
    const hallRent = hall.basePrice;
    
    let foodCost = 0;
    selectedFoodPackages.forEach(id => {
      const pkg = FOOD_PACKAGES.find(p => p.id === id);
      if (pkg) {
        foodCost += pkg.isPerPerson ? pkg.price * guestsCount : pkg.price;
      }
    });

    let decorationCost = 0;
    selectedDecorations.forEach(id => {
      const pkg = DECORATION_PACKAGES.find(p => p.id === id);
      if (pkg) {
        decorationCost += pkg.price;
      }
    });

    const extraCharges = 10000;
    const subtotal = hallRent + foodCost + decorationCost + extraCharges;
    const gst = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gst;
    const advance = Math.round(grandTotal * 0.3);
    const balance = grandTotal - advance;

    return { hallRent, foodCost, decorationCost, extraCharges, subtotal, gst, grandTotal, advance, balance };
  };

  const totals = calculateTotal();

  const handleBookRequest = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    
    setErrorMsg('');

    if (!selectedDate) {
      setErrorMsg('Please select a booking date first.');
      return;
    }

    if (bookedDates.includes(selectedDate)) {
      setErrorMsg('This hall is already booked for the selected date. Please choose another date.');
      return;
    }

    const selectedServicesToSend = [];
    
    selectedFoodPackages.forEach(pkgId => {
      const pkg = FOOD_PACKAGES.find(p => p.id === pkgId);
      if (pkg) {
        selectedServicesToSend.push({
          name: pkg.name,
          category: pkg.isPerPerson ? 'Catering (Buffet)' : 'Catering (Add-on)',
          price: pkg.price,
          quantity: pkg.isPerPerson ? guestsCount : 1
        });
      }
    });

    selectedDecorations.forEach(pkgId => {
      const pkg = DECORATION_PACKAGES.find(p => p.id === pkgId);
      if (pkg) {
        selectedServicesToSend.push({
          name: pkg.name,
          category: pkg.category === 'Decoration' ? 'Decoration (Theme)' : 'Decoration (Add-on)',
          price: pkg.price,
          quantity: 1
        });
      }
    });

    const bookingDetails = {
      hallId: id,
      hallName: hall.name,
      hallLocation: `${hall.city}, ${hall.area}`,
      hallImage: photos?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
      eventType: chosenEvent?.name || 'Custom Celebration',
      eventDate: selectedDate,
      selectedServices: selectedServicesToSend,
      guestsCount,
      baseHallPrice: totals.hallRent,
      servicesTotalPrice: totals.foodCost + totals.decorationCost,
      grandTotalPrice: totals.grandTotal,
      advanceAmount: totals.advance,
      balanceAmount: totals.balance,
    };

    navigate('/payment', { state: { bookingDetails } });
  };

  // Report submission
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await axios.post('/reports', {
        targetType: 'Hall',
        targetId: id,
        issueType: reportIssueType,
        description: reportDescription
      });
      alert('Your complaint has been submitted successfully to the administrator desk.');
      setShowReportModal(false);
      setReportDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-brand-500"></div>
      </div>
    );
  }

  if (!hall) {
    return <div className="text-center py-20 text-slate-500">Venue details not found or removed.</div>;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{hall.name}</h1>
          <div className="flex items-center space-x-2 mt-2 text-xs sm:text-sm text-slate-500">
            <MapPin className="h-4 w-4 text-brand-500" />
            <span>{hall.address}, {hall.area}, {hall.city}</span>
            <span>&bull;</span>
            <div className="flex items-center space-x-1 font-semibold text-slate-800">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{hall.rating || 'N/A'} ({hall.reviewsCount} reviews)</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleWishlistToggle}
            className={`p-3 rounded-full border shadow-sm transition-all ${isInWishlist ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'}`}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="p-3 rounded-full border bg-white border-slate-200 text-slate-400 hover:text-red-500 transition-all shadow-sm"
            title="Report Hall"
          >
            <ShieldAlert className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Photo Gallery (Airbnb-style 5-image layout) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-3xl relative group shadow-lg border border-slate-100">
        {/* Main Hero */}
        <div 
          onClick={() => openLightbox(0)}
          className="md:col-span-2 md:row-span-2 overflow-hidden relative cursor-pointer"
        >
          <img
            src={photos[0]}
            alt="Venue Primary"
            loading="lazy"
            className="h-full w-full object-cover hover:scale-[1.02] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-slate-950/10 hover:bg-slate-950/0 transition-colors" />
        </div>
        {/* Grid Images */}
        {photos.slice(1, 5).map((pic, idx) => (
          <div 
            key={idx}
            onClick={() => openLightbox(idx + 1)}
            className="hidden md:block overflow-hidden relative cursor-pointer"
          >
            <img
              src={pic}
              alt={`Venue Detail ${idx + 1}`}
              loading="lazy"
              className="h-full w-full object-cover hover:scale-[1.03] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-slate-950/10 hover:bg-slate-950/0 transition-colors" />
          </div>
        ))}
        {/* Floating Show All Photos Button */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-1.5 border border-slate-200 active:scale-[0.98] transition-all"
        >
          <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>Show all photos</span>
        </button>
      </div>

      {/* Main Details & Customizer Drawer split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Details, Tour, Amenities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Virtual Tour section */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">360° Virtual Tour</h3>
                <p className="text-xs text-slate-400 mt-0.5">Explore the hall layout digitally before booking</p>
              </div>
              <button
                onClick={() => setViewing360(!viewing360)}
                className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl py-2 px-4 shadow-sm"
              >
                {viewing360 ? 'Close Tour' : 'Launch Virtual Tour'}
              </button>
            </div>

            {viewing360 ? (
              hall.panoramaUrl ? (
                <div className="space-y-3">
                  <div 
                    id="panorama-container" 
                    className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-900"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 text-white z-0 pointer-events-none">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-brand-500 mb-2"></div>
                      <span className="text-xs text-slate-400">Loading interactive 360° tour...</span>
                    </div>
                  </div>
                  {/* Custom control overlays */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                    <span className="text-slate-500">💡 <b>Controls:</b> Drag or swipe to look around. Scroll or pinch to zoom.</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const viewer = window.pannellum?.viewer?.('panorama-container');
                          if (viewer) {
                            viewer.setYaw(0);
                            viewer.setPitch(0);
                            viewer.setHfov(100);
                          }
                        }}
                        className="bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700 transition-colors shadow-sm"
                      >
                        Reset View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const viewer = window.pannellum?.viewer?.('panorama-container');
                          if (viewer) {
                            viewer.setHfov(Math.max(30, viewer.getHfov() - 10));
                          }
                        }}
                        className="bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700 transition-colors shadow-sm"
                      >
                        Zoom In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const viewer = window.pannellum?.viewer?.('panorama-container');
                          if (viewer) {
                            viewer.setHfov(Math.min(120, viewer.getHfov() + 10));
                          }
                        }}
                        className="bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700 transition-colors shadow-sm"
                      >
                        Zoom Out
                      </button>
                      <button
                        type="button"
                        onClick={() => document.getElementById('panorama-container')?.requestFullscreen?.()}
                        className="bg-brand-500 hover:bg-brand-600 text-white px-2.5 py-1 rounded font-bold transition-colors shadow-sm"
                      >
                        Fullscreen
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-400">
                  <ShieldAlert className="h-12 w-12 text-slate-600 mb-3 animate-pulse" />
                  <h4 className="text-sm font-bold text-white">360° Tour Not Available</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">Interactive virtual tour is currently not available for this hall. Check other recommended venues.</p>
                </div>
              )
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200">
                <BadgeInfo className="h-10 w-10 text-slate-300 mb-2" />
                <span className="text-xs font-medium">Click "Launch Virtual Tour" to enter 360° sandbox.</span>
              </div>
            )}
          </div>

          {/* Description & Space Capacities */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">About this Venue</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{hall.description}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seating Capacity</span>
                <span className="block text-lg font-extrabold text-slate-800 mt-1">{hall.capacity} guests</span>
              </div>
              <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dining Capacity</span>
                <span className="block text-lg font-extrabold text-slate-800 mt-1">{hall.diningCapacity} guests</span>
              </div>
              <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">AC / Air Condition</span>
                <span className="block text-lg font-extrabold text-slate-800 mt-1">{hall.isAC ? 'Available' : 'Non-AC'}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rooms Count</span>
                <span className="block text-lg font-extrabold text-slate-800 mt-1">{hall.roomsCount} guest rooms</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">Offered Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {hall.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules & Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Venue Rules</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-500 leading-relaxed">
                {hall.rules.map((rule, idx) => <li key={idx}>{rule}</li>)}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Cancellation Policy</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{hall.cancellationPolicy}</p>
            </div>
          </div>

          {/* Food Packages Section */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Food Packages</h3>
              <p className="text-xs text-slate-400 mt-0.5">Select buffet menus and additional live counter services for your guests</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FOOD_PACKAGES.map((pkg) => {
                const isSelected = selectedFoodPackages.includes(pkg.id);
                return (
                  <div 
                    key={pkg.id} 
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all hover:shadow-md ${isSelected ? 'border-brand-500 bg-brand-50/5' : 'border-slate-100 bg-white'}`}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={pkg.image} 
                        alt={pkg.name} 
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase py-1 px-2.5 rounded-full backdrop-blur-sm ${pkg.category === 'Veg' ? 'bg-green-600/90 text-white' : pkg.category === 'Non-Veg' ? 'bg-red-600/90 text-white' : 'bg-slate-900/95 text-white'}`}>
                        {pkg.category}
                      </span>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-800 text-sm">{pkg.name}</h4>
                          <span className="text-xs font-extrabold text-brand-600">
                            ₹{pkg.price.toLocaleString()}{pkg.isPerPerson ? '/person' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal">{pkg.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFoodPackage(pkg.id)}
                        className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
                      >
                        {isSelected ? 'Remove Package' : 'Add to Booking'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decoration Packages Section */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Decoration Packages</h3>
              <p className="text-xs text-slate-400 mt-0.5">Select a primary theme and optional add-ons to customize the venue's visual experience</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {DECORATION_PACKAGES.map((pkg) => {
                const isSelected = selectedDecorations.includes(pkg.id);
                return (
                  <div 
                    key={pkg.id} 
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all hover:shadow-md ${isSelected ? 'border-brand-500 bg-brand-50/5' : 'border-slate-100 bg-white'}`}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={pkg.image} 
                        alt={pkg.name} 
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 text-[9px] font-bold uppercase py-1 px-2.5 rounded-full backdrop-blur-sm bg-slate-900/95 text-white">
                        {pkg.category}
                      </span>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-800 text-sm">{pkg.name}</h4>
                          <span className="text-xs font-extrabold text-brand-600">
                            ₹{pkg.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal">{pkg.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDecoration(pkg.id)}
                        className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
                      >
                        {isSelected ? 'Remove Package' : 'Add to Booking'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-lg">Reviews & Feedback ({reviews.length})</h3>
            
            {reviews.length === 0 ? (
              <div className="py-6 text-sm text-slate-400 text-center">No reviews have been written for this venue yet.</div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold uppercase">
                          {rev.customer?.name?.[0] || 'C'}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-800">{rev.customer?.name}</span>
                          <span className="block text-[9px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking Customizer */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl lg:sticky lg:top-24 space-y-6">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base rent starting at</span>
            <span className="text-2xl font-extrabold text-brand-600">₹{hall.basePrice?.toLocaleString()}<span className="text-xs text-slate-400 font-normal"> /day</span></span>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Event Date</label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white font-medium"
            />
            {selectedDate && bookedDates.includes(selectedDate) && (
              <span className="block text-[10px] text-red-500 mt-1 font-semibold">This hall is already booked for the selected date. Please choose another date.</span>
            )}
          </div>

          {/* Guest Count Slider */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex justify-between">
              <span>Expected Guests</span>
              <span className="text-slate-400">{guestsCount} plates</span>
            </label>
            <input
              type="range"
              min="50"
              max={hall.capacity || 2000}
              step="10"
              value={guestsCount}
              onChange={(e) => setGuestsCount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
              <span>Min: 50</span>
              <span>Max: {hall.capacity || 2000} (Seating Limit)</span>
            </div>
          </div>

          {/* Celebration Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Celebration Type</label>
            <select
              value={chosenEvent?.name || ''}
              onChange={(e) => {
                const found = eventTypes.find(t => t.name === e.target.value);
                if (found) selectEvent(found);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
            >
              <option value="" disabled>Select event category</option>
              {eventTypes.map(t => (
                <option key={t._id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Pricing breakdowns */}
          <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400">Hall Rent (Base)</span>
              <span className="text-slate-700 font-semibold">₹{totals.hallRent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Food Cost</span>
              <span className="text-slate-700 font-semibold">₹{totals.foodCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Decoration Cost</span>
              <span className="text-slate-700 font-semibold">₹{totals.decorationCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Extra Charges</span>
              <span className="text-slate-700 font-semibold">₹{totals.extraCharges.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/50 pt-2 text-slate-400 font-medium">
              <span>Subtotal</span>
              <span className="text-slate-700 font-semibold">₹{totals.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="text-slate-700 font-semibold">₹{totals.gst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/80 pt-2 font-bold text-sm">
              <span className="text-slate-800">Grand Total</span>
              <span className="text-slate-900">₹{totals.grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] text-brand-600 pt-1 font-semibold">
              <span>Advance to Confirm (30%)</span>
              <span className="font-bold">₹{totals.advance.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleBookRequest}
            disabled={bookingLoading || (selectedDate && bookedDates.includes(selectedDate))}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl py-3 text-sm shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center font-bold"
          >
            {bookingLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Book Now'
            )}
          </button>
          
          <p className="text-[10px] text-slate-400 text-center leading-normal">
            No payment required immediately. Once the hall owner approves your booking, you can make the advance payment to lock in the reservation.
          </p>
        </div>
      </div>

      {/* Complaint / Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Report Listing</h3>
              <p className="text-xs text-slate-500 mt-0.5">Let our administrators desk inspect listing details for safety.</p>
            </div>
            
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase">Issue Type</label>
                <select
                  value={reportIssueType}
                  onChange={(e) => setReportIssueType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 mt-1 focus:outline-none focus:bg-white"
                >
                  <option value="Fake listing">Fake listing / Wrong location</option>
                  <option value="Overpricing">Pricing mismatch / Fraud request</option>
                  <option value="Inaccurate details">Wrong capacity / Bad details</option>
                  <option value="Abusive communication">Abusive owner language</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  required
                  rows="4"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide precise details of the issue..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 mt-1 focus:outline-none focus:bg-white"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-xs text-slate-500 font-semibold px-4 py-2 hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white font-semibold text-xs rounded-xl py-2 px-5 hover:bg-red-700 shadow-md"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 justify-between select-none animate-fade-in backdrop-blur-sm">
          {/* Header controls */}
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-b from-slate-950/50 to-transparent text-white relative z-10">
            <div className="font-bold text-sm tracking-wide text-slate-300">
              {lightboxIndex + 1} / {photos.length}
            </div>
            
            {/* Zoom and close controls */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={zoomOut}
                className="p-2 hover:bg-slate-800/80 rounded-full transition-colors text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <button 
                onClick={zoomIn}
                className="p-2 hover:bg-slate-800/80 rounded-full transition-colors text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              {zoomScale !== 1 && (
                <button 
                  onClick={resetZoom}
                  className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-bold text-slate-200 transition-colors"
                >
                  Reset Zoom
                </button>
              )}
              <button 
                onClick={closeLightbox}
                className="p-2 hover:bg-slate-800/80 rounded-full transition-colors text-slate-300 hover:text-white"
                title="Close (Esc)"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-center relative px-4">
            {/* Left navigation arrow */}
            <button 
              onClick={prevImage}
              className="absolute left-6 z-10 p-3 bg-slate-900/60 hover:bg-slate-900/90 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg border border-slate-800"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Deployed Image with Zoom scale */}
            <div className="max-h-[75vh] max-w-[85vw] overflow-hidden rounded-2xl flex items-center justify-center transition-transform duration-200 shadow-2xl">
              <img
                src={photos[lightboxIndex]}
                alt="Fullscreen Venue Details"
                className="object-contain max-h-[75vh] max-w-[85vw] transition-transform duration-200 ease-out"
                style={{ transform: `scale(${zoomScale})` }}
              />
            </div>

            {/* Right navigation arrow */}
            <button 
              onClick={nextImage}
              className="absolute right-6 z-10 p-3 bg-slate-900/60 hover:bg-slate-900/90 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg border border-slate-800"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Footer thumbnails navigation */}
          <div className="px-6 py-5 bg-gradient-to-t from-slate-950/70 to-transparent overflow-x-auto">
            <div className="flex items-center justify-center space-x-3 min-w-max mx-auto py-1">
              {photos.map((pic, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setZoomScale(1);
                    setLightboxIndex(idx);
                  }}
                  className={`h-14 w-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === lightboxIndex ? 'border-brand-500 scale-105 shadow-md shadow-brand-500/20' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={pic} className="h-full w-full object-cover" alt="Thumbnail" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
