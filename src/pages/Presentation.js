import React from "react";
import Header from "../components/Header";
import "./Presentation.css";

const Presentation = () => {
  return (
    <div className="documentation-container">
      <Header />
      <div className="documentation-wrapper">
        {/* Documentation Header */}
        <div className="documentation-header">
          <h1>Documentation</h1>
          <p>Everything you need to know about our platform</p>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          {[
            { icon: "book", title: "User Guide" },
            { icon: "credit-card", title: "Payment" },
            { icon: "shop", title: "Boutique" },
            { icon: "question-circle", title: "FAQs" },
          ].map((item) => (
            <div key={item.title} className="quick-link-card">
              <i className={`bi bi-${item.icon}`}></i>
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>

        {/* User Guide Section */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-book"></i>
            <h2>User Guide</h2>
          </div>
          <div className="section-content">
            <p>Get started with our comprehensive user guide to make the most of our platform.</p>
            <div className="feature-list">
              <div className="feature-item">
                <i className="bi bi-check2-circle"></i>
                <p>Learn the basics of navigation and core features</p>
              </div>
              <div className="feature-item">
                <i className="bi bi-check2-circle"></i>
                <p>Discover advanced features and customization options</p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Section */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-credit-card"></i>
            <h2>Payment</h2>
          </div>
          <div className="section-content">
            <p>Learn about our secure payment options and billing procedures.</p>
            <div className="payment-grid">
              <div className="payment-card">
                <h3>Accepted Payment Methods</h3>
                <div className="payment-methods">
                  <img src="Algerie Poste.svg" alt="Algerie Poste"></img>
                  <img src="Baridimob.svg" alt="Baridimob"></img>
                </div>
              </div>
              <div className="payment-card">
                <h3>Payment Cycle</h3>
                <p>Monthly</p>
              </div>
            </div>
          </div>
        </section>

        {/* Boutique Section */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-shop"></i>
            <h2>Boutique</h2>
          </div>
          <div className="section-content">
            <p>Browse our collection of premium features and add-ons.</p>
            <div className="plan-grid">
              <div className="plan-card">
                <h3>Plan</h3>
                <p>Custom features for your needs</p>
              </div>
              <div className="plan-card">
                <h3>Plan</h3>
                <p>Custom features for your needs</p>
              </div>
              <div className="plan-card">
                <h3>Plan</h3>
                <p>Custom features for your needs</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-question-circle"></i>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {[
              {
                question: "How do I get started?",
                answer: "First of all, you need someone's ID to 'sign up', after that you can go to the store section and choose the product you want to work on. Copy the product title and total price and share it on social media and when you get an order, go back to Men's Rich and go to your product and add the customer information and click 'buy'. If the order is delivered, you will get your commission that you earned from that product."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept Algerie Poste and Baridimob only"
              },
              {
                question: "How can I contact support?",
                answer: "Our support team is available 24/7 via email or chat."
              }
            ].map((faq, index) => (
              <div key={index} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Presentation;