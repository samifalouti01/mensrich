import React from 'react';
import './LandingPage.css';

const Contact = () => {
  return (
    <section className="contact" id="contact">
      <div className="containerz">
        <h2>تواصل معنا</h2>
        <div className="contact-info">
          <p>Email: <a href="mailto:contact@mensrich.com">contact@mensrich.com</a> <i className="bi bi-envelope" style={{ marginRight: "10px" }}></i></p>
          <p>Address: <span>Bni Malek Villa 91 Skikda, Skikda 21000 - Algeria</span> <i class="bi bi-geo-alt" style={{ marginRight: "10px" }}></i></p>
        </div>
      </div>
    </section>
  );
};

export default Contact;