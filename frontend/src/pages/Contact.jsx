import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Please fill in all fields.');
      return;
    }
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-55/10 to-white min-h-[80vh]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-black tracking-widest text-brand-600 uppercase bg-brand-50 px-4 py-1.5 rounded-full">Contact Support</span>
        <h1 className="mt-4 text-4xl font-black text-slate-900 leading-tight">We are here to help you</h1>
        <p className="mt-4 text-base text-slate-500 font-medium">Have questions about venue listings, catering options, or booking dates? Get in touch with our team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-6">
          {[
            { icon: <Mail className="h-5 w-5 text-brand-600" />, label: 'Email Address', val: 'support@bookmyhall.com' },
            { icon: <Phone className="h-5 w-5 text-brand-600" />, label: 'Phone Number', val: '+91 98765 43210' },
            { icon: <MapPin className="h-5 w-5 text-brand-600" />, label: 'Headquarters', val: 'Jubilee Hills, Hyderabad, India' }
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex items-start space-x-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</h4>
                <p className="text-slate-800 font-bold text-sm mt-1">{item.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-8 sm:p-10 shadow-xl">
          <h3 className="text-xl font-black text-slate-800 mb-6">Send us a Message</h3>
          
          {sent ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl flex items-center space-x-3">
              <Check className="h-6 w-6 text-green-600 flex-shrink-0 animate-bounce" />
              <div>
                <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                <p className="text-xs text-green-600 mt-0.5">Thank you for writing to us. We will get back to you within 24 hours.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Vijay Kumar"
                    className="mt-2 block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vijay@example.com"
                    className="mt-2 block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Message</label>
                <textarea 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you need help with..."
                  className="mt-2 block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <button 
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-brand-500 text-white font-semibold px-6 py-3 hover:bg-brand-600 transition-colors shadow-md shadow-brand-500/10 active:scale-[0.98]"
              >
                Send Message <Send className="ml-2 h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
