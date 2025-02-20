import React, { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import WhyChoose from './WhyChoose';
import TrustpilotWidget from './TrustpilotWidget';
import Contact from './Contact';
import Users from './Users';
import Footer from './Footer';
import './LandingPage.css';

const LandingPage = () => {

  return (
    <div className="App">
      <Header />
      <Hero />
      <HowItWorks />
      <TrustpilotWidget />
      <WhyChoose />
      <TrustpilotWidget />
      <Contact />
      <TrustpilotWidget />
      <Users />
      <Footer />
    </div>
  );
};

export default LandingPage;