import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";
import Loader from '../components/Loader';
import { useTranslation } from 'react-i18next';
import './Helpdesk.css';

const Helpdesk = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    useEffect(() => {
        // Simulate data loading or fetch resources
        const fetchData = async () => {
            try {
                // Simulate a delay (e.g., fetching help topics)
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setIsLoading(false);
            } catch (error) {
                console.error("Error during loading:", error);
                setIsLoading(false); // Fallback to disable loading
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
                alert("There was an error submitting your request.");
            } else {
                console.log("Data inserted successfully:", data);
                alert("Your request has been submitted successfully.");
            }

            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
      };

    if (isLoading) {
        return (
          <div className="loading-container">
            <Loader />
          </div>
        );
      }

    return (
        <div>
            <Header />
            <div className="main-content container mx-auto px-4 py-8">
                <h1 style={{ color: "#000" }} className="text-3xl font-bold mb-4">{t("helpdesk")}</h1>
                <p style={{ color: "#000" }} className="mb-8">{t("helpdeskHeading")}</p>

                <section className="contact-section">
                    <h2>{t("contactUs")}</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="name">{t("name")}</label>
                            <input
                                type="text"
                                className="parrain-input"
                                id="name"
                                name="name"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="email">{t("email")}</label>
                            <input
                                type="email"
                                className="parrain-input"
                                id="email"
                                name="email"
                                placeholder="Your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="message">{t("message")}</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="4"
                                placeholder="Your message"
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                        >
                            {t("submit")}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Helpdesk;
