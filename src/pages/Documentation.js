import React, { useState, useEffect } from "react";
import Loader from '../components/Loader';
import { ChevronLeft } from "lucide-react";
import "./Presentation.css";

const Documentation = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); 

    return () => clearTimeout(timer); 
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="documentation-container">
        <br />
        <br />
        <button
          className="back-button"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="back-icon" />
        </button>
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
            { icon: "youtube", title: "Explanatory video" },
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

        {/* Monthly Income Section */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-cash"></i>
            <h2>Monthly Income</h2>
          </div>
          <div className="section-content">
            <p>Earn a monthly income through various activities on the platform.</p>
            <div className="income-list">
              <div className="income-item">
                <h3>Additional Income</h3>
                <p>With your phone or computer, you can earn additional income by promoting products and referring friends.</p>
              </div>
              <div className="income-item">
                <h3>Ways to Profit</h3>
                <ul>
                  <li>Commission for every confirmed order</li>
                  <li>Refer or invite a friend</li>
                  <li>Monthly income for the team's efforts</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How to Start Section */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-play-circle"></i>
            <h2>How to Start?</h2>
          </div>
          <div className="section-content">
            <p>Starting is very easy. Just follow these steps:</p>
            <div className="steps-list">
              <div className="step-item">
                <h3>How to Register?</h3>
                <ul>
                  <li>Message the owner of the post privately to get the invitation code to join our team.</li>
                  <li>If the invitation code is in the post, copy it.</li>
                  <li>Put the code in the Referral ID box.</li>
                </ul>
              </div>
              <div className="step-item">
                <h3>How to Sell?</h3>
                <ul>
                  <li>Click on the + button at the bottom of Dashboard screen.</li>
                  <li>Click on the store.</li>
                  <li>Choose the product and click on it.</li>
                  <li>Long press on the product image to download it and copy the title and price.</li>
                  <li>Promote the product on social media.</li>
                </ul>
              </div>
              <div className="step-item">
                <h3>How to Order the Product?</h3>
                <ul>
                  <li>In case of an order, enter the product and fill in the order box with the customer's information.</li>
                  <li>When the order is confirmed, you will receive your due commission.</li>
                </ul>
              </div>
              <div className="step-item">
                <h3>How to Refer a Friend?</h3>
                <ul>
                  <li>Copy you ID and share it with friends and on social media.</li>
                </ul>
                <p>Or</p>
                <ul>
                  <li>Click on the + button.</li>
                  <li>Click Refferal.</li>
                  <li>Add your friend's informations and click register.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Levels and Points Section */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-graph-up"></i>
            <h2>Levels and Points</h2>
          </div>
          <div className="section-content">
            <p>Your monthly salary depends on your team's efforts and the points you accumulate.</p>
            <div className="levels-list">
              <div className="level-item">
                <h3>Levels</h3>
                <ul>
                  <li>Distributeur level</li>
                  <li>Animateur level</li>
                  <li>Animateur Junior level</li>
                  <li>Animateur Senior level</li>
                  <li>Manager level</li>
                  <li>Manager Junior level</li>
                  <li>Manager Senior level</li>
                </ul>
              </div>
              <div className="level-item">
                <h3>Moving to the Next Level</h3>
                <ul>
                  <li>Points from the previous month</li>
                  <li>Points from this month</li>
                  <li>Points you need to move to the next level</li>
                </ul>
                <p>Example: If you are at Animateur level and your Next level is Animateur Junior and you need 6250 points. Your points from the previous month is 2300 points + points from this month is 2100 points = 4400 points, you dont move to the next level. But if Your points from the previous month is 4900 points + points from this month is 1400 points = 6300 points, you will move to the next level.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Explanatory Video Section */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-youtube"></i>
            <h2>Explanatory Video</h2>
          </div>
          <div className="plan-grid">
            <iframe
              width="100%"
              height="auto"
              style={{ borderRadius: "20px", maxWidth: "550px", maxHeight: "400px", minHeight: "300px" }}
              src="https://www.youtube.com/embed/-Vumls3bQmI?si=lkpwFPSRkWvTQgqu"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
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
                answer: "Our support team is available 24/7 via email: contact@mensrich.com or helpdesk section."
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

export default Documentation;