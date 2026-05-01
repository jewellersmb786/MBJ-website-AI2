import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../api';

const FALLBACK_HEADING = 'About Jewellers MB';
const FALLBACK_BODY = [
  'At Jewellers MB, we celebrate the rich heritage of South Indian jewellery craftsmanship. Specializing in intricate Nakshi work and timeless Antique designs, we create bridal treasures that connect generations.',
  'Each piece tells a story of tradition, artistry, and the sacred beauty of South Indian culture.',
];

const AboutPage = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    settingsAPI.getPublic().then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const heading = settings?.about_heading || FALLBACK_HEADING;
  const paragraphs = settings?.about_body
    ? settings.about_body.split('\n').filter(p => p.trim())
    : FALLBACK_BODY;

  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="text-4xl font-playfair font-bold mb-6 text-[#D4AF37]">{heading}</h1>
      <div className="max-w-3xl">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;
