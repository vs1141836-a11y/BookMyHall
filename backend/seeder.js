import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import FunctionHall from './models/FunctionHall.js';
import EventType from './models/EventType.js';
import Vendor from './models/Vendor.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';
import Review from './models/Review.js';
import Notification from './models/Notification.js';
import Wishlist from './models/Wishlist.js';
import Report from './models/Report.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookmyhall');

const seedData = async () => {
  try {
    // 1. Clear old collections
    await User.deleteMany();
    await FunctionHall.deleteMany();
    await EventType.deleteMany();
    await Vendor.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();
    await Wishlist.deleteMany();
    await Report.deleteMany();

    console.log('Database cleared...');

    // 2. Hash passwords for seed users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 3. Create Seed Users
    const users = await User.create([
      {
        name: 'App Admin',
        email: 'admin@bookmyhall.com',
        password: hashedPassword,
        role: 'admin',
        phone: '9876543210',
        isVerified: true,
      },
      {
        name: 'Ramesh Kumar (Owner)',
        email: 'owner@bookmyhall.com',
        password: hashedPassword,
        role: 'owner',
        phone: '8765432109',
        isVerified: true,
      },
      {
        name: 'Vijay Patel (Customer)',
        email: 'customer@bookmyhall.com',
        password: hashedPassword,
        role: 'customer',
        phone: '7654321098',
        isVerified: true,
      }
    ]);

    const admin = users[0];
    const owner = users[1];
    const customer = users[2];

    console.log('Seed users created...');

    // 4. Create Event Types
    const marriageServices = [
      { name: 'Stage Decoration (Orchids & Roses)', category: 'Decoration', defaultPrice: 75000, isOptional: true, isCustomizable: true },
      { name: 'Welcome Flower Arch', category: 'Decoration', defaultPrice: 15000, isOptional: true, isCustomizable: true },
      { name: 'Traditional Catering (Veg - 500 plates)', category: 'Catering', defaultPrice: 150000, isOptional: false, isCustomizable: true },
      { name: 'Traditional Catering (Non Veg - 500 plates)', category: 'Catering', defaultPrice: 225000, isOptional: true, isCustomizable: true },
      { name: 'Standard Photography & Videography', category: 'Photography', defaultPrice: 50000, isOptional: true, isCustomizable: true },
      { name: 'Cinematic Drone & Video Package', category: 'Photography', defaultPrice: 35000, isOptional: true, isCustomizable: true },
      { name: 'Wedding DJ with Sound Rig', category: 'DJ', defaultPrice: 25000, isOptional: true, isCustomizable: true },
      { name: 'Generator Backup', category: 'Amenities', defaultPrice: 10000, isOptional: false, isCustomizable: false }
    ];

    const receptionServices = [
      { name: 'Premium Stage Floral Arch & Lighting', category: 'Decoration', defaultPrice: 60000, isOptional: false, isCustomizable: true },
      { name: 'Buffet Catering (Mix Veg/Non-Veg - 300 plates)', category: 'Catering', defaultPrice: 180000, isOptional: false, isCustomizable: true },
      { name: 'Reception DJ with Laser Show', category: 'DJ', defaultPrice: 30000, isOptional: true, isCustomizable: true },
      { name: 'Candid Photography & Highlights Video', category: 'Photography', defaultPrice: 45000, isOptional: true, isCustomizable: true }
    ];

    const engagementServices = [
      { name: 'Elegant Floral Ring Stage Decor', category: 'Decoration', defaultPrice: 35000, isOptional: false, isCustomizable: true },
      { name: 'High Tea Snacks & Drinks (200 pax)', category: 'Catering', defaultPrice: 60000, isOptional: false, isCustomizable: true },
      { name: 'Traditional Catering (Veg - 200 plates)', category: 'Catering', defaultPrice: 80000, isOptional: true, isCustomizable: true },
      { name: 'Engagement Photography', category: 'Photography', defaultPrice: 20000, isOptional: true, isCustomizable: true }
    ];

    const birthdayServices = [
      { name: 'Theme Balloon Decor (Standard)', category: 'Decoration', defaultPrice: 15000, isOptional: false, isCustomizable: true },
      { name: 'Premium Theme Stage Setup', category: 'Decoration', defaultPrice: 30000, isOptional: true, isCustomizable: true },
      { name: 'Kid-friendly Buffet (Veg - 100 plates)', category: 'Catering', defaultPrice: 35000, isOptional: false, isCustomizable: true },
      { name: 'Birthday Cake (2-Tier Designer)', category: 'Cake', defaultPrice: 5000, isOptional: true, isCustomizable: true },
      { name: 'Magic Show & Balloon Twisting (1 Hr)', category: 'Entertainment', defaultPrice: 8000, isOptional: true, isCustomizable: true },
      { name: 'Kids DJ & Play Music', category: 'DJ', defaultPrice: 12000, isOptional: true, isCustomizable: true }
    ];

    const babyShowerServices = [
      { name: 'Traditional cradle & seating floral decor', category: 'Decoration', defaultPrice: 25000, isOptional: false, isCustomizable: true },
      { name: 'Traditional South Indian Veg Meal (200 plates)', category: 'Catering', defaultPrice: 70000, isOptional: false, isCustomizable: true },
      { name: 'Baby Shower Photographer', category: 'Photography', defaultPrice: 18000, isOptional: true, isCustomizable: true }
    ];

    const namingServices = [
      { name: 'Theme Cradle Flower Canopy', category: 'Decoration', defaultPrice: 20000, isOptional: false, isCustomizable: true },
      { name: 'Veg Lunch Buffet (250 plates)', category: 'Catering', defaultPrice: 85000, isOptional: false, isCustomizable: true },
      { name: 'Naming Ceremony Priest/Pooja Setup', category: 'Priest', defaultPrice: 7500, isOptional: true, isCustomizable: false }
    ];

    const housewarmingServices = [
      { name: 'Entrance door mango leaf & flower decor', category: 'Decoration', defaultPrice: 12000, isOptional: false, isCustomizable: true },
      { name: 'Satyanarayana Pooja Priest & materials', category: 'Priest', defaultPrice: 10000, isOptional: false, isCustomizable: false },
      { name: 'Traditional Veg Feast (150 plates)', category: 'Catering', defaultPrice: 55000, isOptional: false, isCustomizable: true },
      { name: 'Candid Housewarming Photography', category: 'Photography', defaultPrice: 15000, isOptional: true, isCustomizable: true }
    ];

    const anniversaryServices = [
      { name: 'Silver/Golden Stage Backdrop decoration', category: 'Decoration', defaultPrice: 25000, isOptional: false, isCustomizable: true },
      { name: 'Dinner Buffet (Veg/Non-Veg - 150 plates)', category: 'Catering', defaultPrice: 75000, isOptional: false, isCustomizable: true },
      { name: 'Designer Anniversary Cake', category: 'Cake', defaultPrice: 4000, isOptional: true, isCustomizable: true },
      { name: 'Live Acoustic Guitarist/Singer (2 Hrs)', category: 'Entertainment', defaultPrice: 12000, isOptional: true, isCustomizable: true }
    ];

    const corporateServices = [
      { name: 'Projector & Dual Screens Setup', category: 'AV Equipment', defaultPrice: 8000, isOptional: false, isCustomizable: false },
      { name: 'Corporate Sound & Collar Mics', category: 'AV Equipment', defaultPrice: 5000, isOptional: false, isCustomizable: true },
      { name: 'Executive Buffet (150 Pax)', category: 'Catering', defaultPrice: 90000, isOptional: false, isCustomizable: true },
      { name: 'Corporate Host / Emcee', category: 'Entertainment', defaultPrice: 15000, isOptional: true, isCustomizable: true },
      { name: 'Live Acoustic Band (2 Hrs)', category: 'Entertainment', defaultPrice: 40000, isOptional: true, isCustomizable: true }
    ];

    const farewellServices = [
      { name: 'Basic stage backdrop & banner print', category: 'Decoration', defaultPrice: 10000, isOptional: false, isCustomizable: true },
      { name: 'Snacks & Evening High Tea Buffet (200 pax)', category: 'Catering', defaultPrice: 50000, isOptional: false, isCustomizable: true },
      { name: 'Group Farewell Photography', category: 'Photography', defaultPrice: 12000, isOptional: true, isCustomizable: true }
    ];

    const retirementServices = [
      { name: 'Traditional stage seating & floral design', category: 'Decoration', defaultPrice: 15000, isOptional: false, isCustomizable: true },
      { name: 'Dinner buffet (Veg - 150 plates)', category: 'Catering', defaultPrice: 52000, isOptional: false, isCustomizable: true },
      { name: 'Felicitation Shawl, Bouquet & Memento', category: 'Gifts', defaultPrice: 6000, isOptional: false, isCustomizable: false }
    ];

    const culturalServices = [
      { name: 'Stage Sound rigs & vocal microphones', category: 'AV Equipment', defaultPrice: 15000, isOptional: false, isCustomizable: true },
      { name: 'Stage LED color lights rig', category: 'AV Equipment', defaultPrice: 12000, isOptional: false, isCustomizable: true },
      { name: 'Catering snacks & refreshments (400 pax)', category: 'Catering', defaultPrice: 80000, isOptional: false, isCustomizable: true },
      { name: 'Full stage videography (Multi-cam)', category: 'Photography', defaultPrice: 30000, isOptional: true, isCustomizable: true }
    ];

    const festivalServices = [
      { name: 'Grand festival entrance banana/mango leaf decor', category: 'Decoration', defaultPrice: 18000, isOptional: false, isCustomizable: true },
      { name: 'Festival Traditional Lunch Veg (300 plates)', category: 'Catering', defaultPrice: 105000, isOptional: false, isCustomizable: true },
      { name: 'Festival Pooja Priest & Materials', category: 'Priest', defaultPrice: 8500, isOptional: true, isCustomizable: false },
      { name: 'Dhol/Traditional Musicians team', category: 'Music', defaultPrice: 15000, isOptional: true, isCustomizable: true }
    ];

    const familyServices = [
      { name: 'Standard stage backdrop decoration', category: 'Decoration', defaultPrice: 15000, isOptional: false, isCustomizable: true },
      { name: 'Standard Dinner Buffet (Veg - 200 plates)', category: 'Catering', defaultPrice: 70000, isOptional: false, isCustomizable: true },
      { name: 'Family Group Photography', category: 'Photography', defaultPrice: 15000, isOptional: true, isCustomizable: true }
    ];

    const eventTypes = await EventType.create([
      { name: 'Marriage', description: 'Traditional and grand Indian weddings.', icon: 'heart', defaultServices: marriageServices, isCustom: false },
      { name: 'Reception', description: 'Post-wedding celebrations and social banquets.', icon: 'glass-water', defaultServices: receptionServices, isCustom: false },
      { name: 'Engagement', description: 'Ring ceremony celebrations and high-tea gatherings.', icon: 'gem', defaultServices: engagementServices, isCustom: false },
      { name: 'Birthday', description: 'Fun-filled birthday celebrations and designer cakes.', icon: 'gift', defaultServices: birthdayServices, isCustom: false },
      { name: 'Baby Shower', description: 'Traditional cradle and baby shower events.', icon: 'baby', defaultServices: babyShowerServices, isCustom: false },
      { name: 'Naming Ceremony', description: 'Newborn child naming functions and traditional feasts.', icon: 'smile', defaultServices: namingServices, isCustom: false },
      { name: 'Housewarming', description: 'New house Griha Pravesh pooja celebrations.', icon: 'home', defaultServices: housewarmingServices, isCustom: false },
      { name: 'Anniversary', description: 'Marriage anniversary celebrations and social gatherings.', icon: 'award', defaultServices: anniversaryServices, isCustom: false },
      { name: 'Corporate Events', description: 'Professional seminars, conventions, and meets.', icon: 'briefcase', defaultServices: corporateServices, isCustom: false },
      { name: 'Farewell', description: 'Send-off social banquets for colleagues and graduates.', icon: 'log-out', defaultServices: farewellServices, isCustom: false },
      { name: 'Retirement', description: 'Milestone retirement felicitation ceremonies.', icon: 'check-square', defaultServices: retirementServices, isCustom: false },
      { name: 'Cultural Programs', description: 'Dance, music, theatrical stage shows, and visual AV events.', icon: 'music', defaultServices: culturalServices, isCustom: false },
      { name: 'Festival Celebrations', description: 'Traditional Indian seasonal festival functions.', icon: 'sun', defaultServices: festivalServices, isCustom: false },
      { name: 'Family Functions', description: 'Get-togethers, relative dinners, and general social functions.', icon: 'users', defaultServices: familyServices, isCustom: false }
    ]);

    console.log('Event types seeded...');

    // 5. Create Function Halls
    const halls = await FunctionHall.create([
      {
        owner: owner._id,
        name: 'Grand Palace Convention Center',
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
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 150000,
        rating: 4.8,
        reviewsCount: 1,
        isApproved: true
      },
      {
        owner: owner._id,
        name: 'Tulip Celebration Banquet',
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
        rating: 4.5,
        reviewsCount: 0,
        isApproved: true
      },
      {
        owner: owner._id,
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
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 220000,
        rating: 4.9,
        reviewsCount: 0,
        isApproved: true
      },
      {
        owner: owner._id,
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
        rating: 4.2,
        reviewsCount: 0,
        isApproved: true
      },
      {
        owner: owner._id,
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
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 220000,
        rating: 4.9,
        reviewsCount: 0,
        isApproved: true
      },
      {
        owner: owner._id,
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
          'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 180000,
        rating: 4.7,
        reviewsCount: 0,
        isApproved: true
      },
      {
        owner: owner._id,
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
        rating: 4.4,
        reviewsCount: 0,
        isApproved: true
      },
      {
        owner: owner._id,
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
        rating: 4.8,
        reviewsCount: 0,
        isApproved: true
      },
      {
        owner: owner._id,
        name: 'OMR Tech Park Convention Center',
        description: 'A modern, high-tech, spacious convention center specifically optimized for massive IT events, large corporate trade fairs, and upscale software conferences.',
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
        rating: 4.6,
        reviewsCount: 0,
        isApproved: true
      },
      {
        owner: owner._id,
        name: 'Marina Beach Banquet Hall',
        description: 'Traditional and historic boutique banquet hall in Mylapore, specialized in hosting classical music programs, bharatanatyam arangetrams, naming ceremonies, and south Indian veg marriages.',
        address: 'Luz Church Road, Mylapore',
        city: 'Chennai',
        area: 'Mylapore',
        coordinates: { lat: 13.0330, lng: 80.2685 },
        capacity: 300,
        diningCapacity: 150,
        parkingCapacity: 20,
        isAC: true,
        roomsCount: 3,
        amenities: ['Traditional Decor', 'AC Halls', 'Basic Sound mic set', 'Traditional dining tables'],
        rules: ['Vegetarian catering only', 'No alcohol allowed inside Mylapore limits'],
        cancellationPolicy: 'Refundable with 15% cancellation fee.',
        photos: [
          'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 40000,
        rating: 4.3,
        reviewsCount: 0,
        isApproved: true
      },
      {
        owner: owner._id,
        name: 'East Coast Road Luxury Resort',
        description: 'Premium seaside resort lawn and banquet hall. Offers a majestic panoramic view of the Bay of Bengal, palm trees, and ECR coastal breeze for luxurious private destination weddings.',
        address: 'ECR Highway, Muttukadu',
        city: 'Chennai',
        area: 'ECR',
        coordinates: { lat: 12.8906, lng: 80.2372 },
        capacity: 1500,
        diningCapacity: 700,
        parkingCapacity: 300,
        isAC: true,
        roomsCount: 18,
        amenities: ['Central AC', 'Resort Lawns', 'Sea View Deck', 'Poolside Banquets', 'VIP Cottages'],
        rules: ['Catering partners must be chosen from resort pre-approved panel', 'Outdoor music allowed until 11:30 PM'],
        cancellationPolicy: 'Date changes allowed. Cancellation incurs 50% loss.',
        photos: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 190000,
        rating: 4.8,
        reviewsCount: 0,
        isApproved: true
      },
      {
        owner: owner._id,
        name: 'Chennai Heritage Cultural Center',
        description: 'Located in the heart of T-Nagar shopping hub. Features traditional Dravidian architecture details on wooden pillars, grand stage lights, and spacious air-conditioned halls.',
        address: 'G N Chetty Road, T-Nagar',
        city: 'Chennai',
        area: 'T-Nagar',
        coordinates: { lat: 13.0418, lng: 80.2337 },
        capacity: 750,
        diningCapacity: 350,
        parkingCapacity: 80,
        isAC: true,
        roomsCount: 8,
        amenities: ['AC Hall', 'Dravidian Pillars architecture', 'Valet Parking', 'Stage Lighting rig'],
        rules: ['No flower petals allowed on stage carpet', 'Loud horns/firecrackers banned in T-Nagar limits'],
        cancellationPolicy: 'Rescheduling allowed up to 45 days before the event.',
        photos: [
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200'
        ],
        basePrice: 85000,
        rating: 4.5,
        reviewsCount: 0,
        isApproved: true
      }
    ]);

    console.log('Function halls seeded...');

    // 6. Create Seed Vendors
    await Vendor.create([
      {
        owner: owner._id,
        name: 'Royal Elite Florists & Decors',
        category: 'Decorators',
        contactPhone: '9000190002',
        pricing: 'Packages start from ₹50,000',
        description: 'Specialists in orchid stage setups, destination wedding canopies, and fairy light backdrops.',
        packages: [
          { packageName: 'Bronze', price: 45000, services: ['Standard Stage Canopy', 'Welcome arch', 'LED par lights'] },
          { packageName: 'Silver', price: 75000, services: ['Premium flower stage', 'Entrance path styling', 'High-end lighting'] },
          { packageName: 'Gold', price: 120000, services: ['Exotic orchid theme Stage', 'VIP seating styling', 'Pathway walkway tunnels'] }
        ]
      },
      {
        owner: owner._id,
        name: 'Nagarjuna Caterers & Banquets',
        category: 'Caterers',
        contactPhone: '9000390004',
        pricing: '₹350 - ₹900 per plate',
        description: 'Authentic South Indian Veg/Non-Veg, North Indian Tandoor, and Multi-Cuisine Dessert bars.',
        packages: [
          { packageName: 'Silver Veg', price: 500, services: ['2 Starters', '1 Rice item', '2 Curries', '1 Sweet'] },
          { packageName: 'Gold Mix', price: 750, services: ['3 Starters Veg/NonVeg', 'Biryani Live Station', '3 Curries', '2 Sweets'] }
        ]
      }
    ]);

    console.log('Vendors seeded...');

    // 7. Seed one booking & review to populate average ratings
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() - 5); // 5 days ago

    const booking = await Booking.create({
      customer: customer._id,
      hall: halls[0]._id,
      eventType: 'Marriage',
      eventDate: bookingDate,
      selectedServices: [
        { name: 'Stage Decoration (Orchids & Roses)', category: 'Decoration', price: 75000, quantity: 1 },
        { name: 'Traditional Catering (Veg - 500 plates)', category: 'Catering', price: 150000, quantity: 1 }
      ],
      baseHallPrice: 150000,
      servicesTotalPrice: 225000,
      grandTotalPrice: 375000,
      advanceAmount: 112500,
      balanceAmount: 262500,
      paidAmount: 375000,
      paymentStatus: 'Fully Paid',
      bookingStatus: 'Event Completed',
      timeline: [
        { status: 'Pending Approval', description: 'Submitted request.' },
        { status: 'Approved', description: 'Owner approved.' },
        { status: 'Advance Paid', description: 'Advance payment verified.' },
        { status: 'Event Completed', description: 'Event completed on date.' }
      ]
    });

    const payment = await Payment.create({
      booking: booking._id,
      customer: customer._id,
      amount: 375000,
      paymentType: 'Full',
      razorpayOrderId: 'rzp_mock_seeded_payment',
      razorpayPaymentId: 'pay_mock_seeded',
      status: 'Success',
      invoiceUrl: `http://localhost:5000/invoices/invoice-mock-seed.pdf`
    });

    booking.payments.push(payment._id);
    await booking.save();

    await Review.create({
      customer: customer._id,
      booking: booking._id,
      hall: halls[0]._id,
      rating: 5,
      serviceRating: 4.8,
      comment: 'Absolutely spectacular convention center. The stage was gigantic, decor was handled cleanly, and ramesh was a stellar owner to work with. Worth every single rupee!',
    });

    console.log('Booking and review seeded. Stats updated!');
    console.log('Database Seeding Successful!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
