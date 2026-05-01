import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { settingsAPI } from '../api';

const ContactPage = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    settingsAPI.getPublic().then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const phone = settings?.phone || '+91 7019539776';
  const email = settings?.email || 'jewellersmb786@gmail.com';
  const whatsapp = settings?.whatsapp;
  const address = settings?.address;
  const storeLocation = settings?.store_location;

  const waNumber = whatsapp ? whatsapp.replace(/\D/g, '') : '';

  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="text-4xl font-playfair font-bold mb-6 text-[#D4AF37]">Contact Us</h1>
      <div className="max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Phone className="w-6 h-6 text-gold" />
            <div>
              <p className="font-semibold">Phone</p>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-gold hover:underline">{phone}</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Mail className="w-6 h-6 text-gold" />
            <div>
              <p className="font-semibold">Email</p>
              <a href={`mailto:${email}`} className="text-gold hover:underline">{email}</a>
            </div>
          </div>
          {whatsapp && (
            <div className="flex items-center space-x-4">
              <MessageCircle className="w-6 h-6 text-gold" />
              <div>
                <p className="font-semibold">WhatsApp</p>
                <a
                  href={`https://wa.me/${waNumber}?text=Hi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline"
                >
                  {whatsapp}
                </a>
              </div>
            </div>
          )}
          {address && (
            <div className="flex items-center space-x-4">
              <MapPin className="w-6 h-6 text-gold" />
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-gold">{address}</p>
              </div>
            </div>
          )}
          {storeLocation && (
            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 text-gold mt-1" />
              <div>
                <p className="font-semibold">Store Location</p>
                {storeLocation.split('\n').map((line, i) => (
                  <p key={i} className="text-gold">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
