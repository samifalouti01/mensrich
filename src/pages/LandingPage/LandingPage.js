import React, { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import WhyChoose from './WhyChoose';
import Contact from './Contact';
import Footer from './Footer';
import './LandingPage.css';

const LandingPage = () => {

  return (
    <div className="App">
      <Header />
      <Hero />
      <HowItWorks />
      <WhyChoose />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;