import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from './SEOHead';
import { getOrganizationSchema } from '../lib/seo';

export const ContactView: React.FC = () => {
  const { user, showToast } = useAuth();
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState('Tour Package Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      showToast('Please fill in your name, contact phone, and message.', 'error');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast('Message sent successfully! Our team will contact you shortly.', 'success');
    }, 600);
  };

  return (
    <article className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 animate-fadeIn">
      <SEOHead
        title="Contact Azraq Trips – Dhaka Travel Agency Desk & WhatsApp Support"
        description="Get in touch with Azraq Trips travel desk in Dhaka. Inquire about customized tour packages, Asian visa processing, flights, or urgent travel assistance."
        canonical="https://www.azraqtrips.com/contact"
        structuredData={getOrganizationSchema()}
      />

      {/* Header */}
      <section aria-labelledby="contact-heading" className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0D6EFD] text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Get in Touch</span>
        </div>
        <h1 id="contact-heading" className="text-3xl sm:text-4xl font-extrabold text-[#071A33] tracking-tight">
          Contact Azraq
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Have a question about a package, visa requirements, or customized itinerary? Reach out to our Dhaka travel desk.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Container */}
        <section aria-labelledby="inquiry-form-heading" className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <h2 id="inquiry-form-heading" className="sr-only">Send an Inquiry</h2>
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto" aria-hidden="true">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#071A33]">Message Sent!</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for contacting us, {name}. A dedicated travel specialist from Azraq will respond to your request via phone/WhatsApp within 2 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#0D6EFD] text-white font-bold text-sm hover:bg-blue-700 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0D6EFD] focus-visible:outline-none"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" aria-label="Customer Travel Inquiry Form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-full-name" className="text-xs font-bold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-full-name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Istihad Ahmed"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-[#071A33] focus:outline-none focus:border-[#0D6EFD] focus-visible:ring-2 focus-visible:ring-[#0D6EFD]"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="text-xs font-bold text-slate-700">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 18XX-XXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-[#071A33] focus:outline-none focus:border-[#0D6EFD] focus-visible:ring-2 focus-visible:ring-[#0D6EFD]"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-bold text-slate-700">
                    Email Address (Optional)
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-[#071A33] focus:outline-none focus:border-[#0D6EFD] focus-visible:ring-2 focus-visible:ring-[#0D6EFD]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-service-category" className="text-xs font-bold text-slate-700">
                    Service Category
                  </label>
                  <select
                    id="contact-service-category"
                    name="category"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-[#071A33] focus:outline-none focus:border-[#0D6EFD] focus-visible:ring-2 focus-visible:ring-[#0D6EFD]"
                  >
                    <option value="Tour Package Inquiry">Tour Package Inquiry</option>
                    <option value="Visa Assistance">Visa Assistance</option>
                    <option value="Custom Family Trip">Custom Family Trip</option>
                    <option value="Corporate / Group Travel">Corporate / Group Travel</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-bold text-slate-700">
                  Your Message / Requirements <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Tell us your intended destination, travel dates, and any specific preferences..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-[#071A33] focus:outline-none focus:border-[#0D6EFD] focus-visible:ring-2 focus-visible:ring-[#0D6EFD]"
                  required
                  aria-required="true"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0D6EFD] hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0D6EFD] focus-visible:outline-none"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
              </button>
            </form>
          )}
        </section>

        {/* Right Information Cards */}
        <section aria-labelledby="direct-contact-heading" className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <h2 id="direct-contact-heading" className="text-base font-bold text-[#071A33]">
              Direct Contact Information
            </h2>
            <address className="not-italic space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0D6EFD] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-slate-900">Head Office</p>
                  <p className="text-slate-600 text-xs mt-0.5">Dhaka, Bangladesh</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#0D6EFD] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-slate-900">WhatsApp & Phone Support</p>
                  <a
                    href="https://wa.me/8801851172032"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#0D6EFD] font-mono hover:underline block mt-0.5 focus-visible:ring-2 focus-visible:ring-[#0D6EFD] focus-visible:outline-none rounded"
                    aria-label="Chat on WhatsApp with Azraq Trips at +880 1851-172032"
                  >
                    +880 1851-172032
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#0D6EFD] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-slate-900">Email Inquiries</p>
                  <a
                    href="mailto:info@azraqtrips.com"
                    className="text-xs text-[#0D6EFD] font-mono hover:underline block mt-0.5 focus-visible:ring-2 focus-visible:ring-[#0D6EFD] focus-visible:outline-none rounded"
                    aria-label="Email Azraq Trips at info@azraqtrips.com"
                  >
                    info@azraqtrips.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#0D6EFD] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-slate-900">Working Hours</p>
                  <p className="text-slate-600 text-xs mt-0.5">Sat – Thu: 10:00 AM – 8:00 PM (BST)</p>
                  <p className="text-slate-500 text-[11px]">Emergency hotline open 24/7</p>
                </div>
              </div>
            </address>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-3">
            <h3 className="text-sm font-bold text-emerald-900">Instant WhatsApp Chat</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Prefer chatting directly on WhatsApp for immediate package details and visa requirements?
            </p>
            <a
              href="https://wa.me/8801851172032?text=Hello%20Azraq!%20I%20have%20an%20inquiry."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
              aria-label="Open WhatsApp conversation with Azraq Trips team"
            >
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </section>
      </div>
    </article>
  );
};
