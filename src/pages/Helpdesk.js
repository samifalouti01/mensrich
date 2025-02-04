import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Loader from '../components/Loader';
import { MessageCircle, Mail, User } from "lucide-react";
import './Helpdesk.css';

const HelpField = ({ label, icon: Icon, value, onChange, type = "text", placeholder }) => {
  return (
    <div className="help-field">
      <div className="help-field-header">
        <span className="help-field-label">{label}</span>
        <Icon className="field-icon" size={16} />
      </div>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="help-textarea"
          rows="4"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="help-input"
        />
      )}
    </div>
  );
};

const Helpdesk = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (error) {
        console.error("Error during loading:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    try {
      const { data, error } = await supabase
        .from('help')
        .insert([{ name, email, message }]);

      if (error) {
        console.error("Error inserting data:", error);
        setMessage("There was an error submitting your request.");
      } else {
        setMessage("Your request has been submitted successfully!");
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="helpdesk-page">
      <Header />
      <div className="helpdesk-container">
        <div className="helpdesk-card">
          <div className="helpdesk-header">
            <h2 className="helpdesk-title">اتصل بالدعم</h2>
          </div>
          <div className="helpdesk-content">
            {message && (
              <div className="message">
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <HelpField
                label="الاسم"
                icon={User}
                value={formData.name}
                onChange={(e) => handleInputChange({ target: { name: 'name', value: e.target.value } })}
                placeholder="أدخل اسمك"
              />
              <HelpField
                label="البريد الإلكتروني"
                icon={Mail}
                value={formData.email}
                onChange={(e) => handleInputChange({ target: { name: 'email', value: e.target.value } })}
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
              />
              <HelpField
                label="الرسالة"
                icon={MessageCircle}
                value={formData.message}
                onChange={(e) => handleInputChange({ target: { name: 'message', value: e.target.value } })}
                type="textarea"
                placeholder="كيف يمكننا مساعدتك؟"
              />
              <button type="submit" className="submit-button">
                إرسال الطلب
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Helpdesk;