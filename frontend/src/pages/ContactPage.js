import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-playfair font-bold mb-6">Contact Us</h1>
      <div className="max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Phone className="w-6 h-6 text-gold" />
            <div>
              <p className="font-semibold">Phone</p>
              <a href="tel:+917019539776" className="text-gold hover:underline">+91 7019539776</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Mail className="w-6 h-6 text-gold" />
            <div>
              <p className="font-semibold">Email</p>
              <a href="mailto:jewellersmb786@gmail.com" className="text-gold hover:underline">jewellersmb786@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
