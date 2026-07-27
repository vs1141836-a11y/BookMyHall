import React from 'react';
import { Sparkles, Calendar, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50/10 to-white min-h-[80vh]">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-black tracking-widest text-brand-600 uppercase bg-brand-50 px-4 py-1.5 rounded-full">About Us</span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          Simplifying Celebrations at <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">BookMyHall</span>
        </h1>
        <p className="mt-6 text-lg text-slate-500 leading-relaxed font-medium">
          We believe that planning a lifetime memory should start with zero friction. BookMyHall is a premium customer-only platform connecting users with state-of-the-art function halls, wedding venues, and banquet facilities.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Calendar className="h-6 w-6 text-brand-600" />, title: 'Effortless Booking', desc: 'Browse available dates, select customized food packages, and send reservation requests in under 2 minutes.' },
          { icon: <Heart className="h-6 w-6 text-pink-600" />, title: 'Curated Venues', desc: 'All listed properties undergo strict quality checks for premium air conditioning, spacious parking, and clean dining areas.' },
          { icon: <ShieldCheck className="h-6 w-6 text-green-600" />, title: 'Secured Payments', desc: 'Integrated with Razorpay to provide secure billing, advance deposits, and dynamic digital invoice downloads.' },
          { icon: <Sparkles className="h-6 w-6 text-amber-600" />, title: 'Event Customizations', desc: 'Add food catering packages (Veg & Non-Veg buffets), professional lighting setups, stage decorations, and audio DJ packages.' }
        ].map((feat, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center mb-5">
              {feat.icon}
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{feat.title}</h3>
            <p className="text-slate-500 text-sm mt-2.5 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 rounded-3xl bg-slate-900 p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="max-w-xl text-center lg:text-left z-10">
          <h2 className="text-3xl font-black">Ready to secure your event space?</h2>
          <p className="mt-3 text-slate-400 text-sm font-medium">Browse our premium venues, compare prices, and start planning your perfect celebration today.</p>
        </div>
        <Link 
          to="/halls" 
          className="mt-8 lg:mt-0 flex-shrink-0 inline-flex items-center rounded-full bg-white text-slate-900 font-bold px-6 py-3.5 hover:bg-slate-100 transition-colors shadow-lg z-10 active:scale-[0.98]"
        >
          Explore Function Halls <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
