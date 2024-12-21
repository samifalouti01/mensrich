import React, { useState } from "react";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";
import './Helpdesk.css';

const Helpdesk = () => {
    // State for form inputs
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Destructure form data
        const { name, email, message } = formData;

        try {
            // Insert data into the 'help' table
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

            // Optionally, reset form after successful submission
            setFormData({ name: '', email: '', message: '' });

        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div>
            <Header />
            <div className="main-content container mx-auto px-4 py-8">
                <h1 style={{ color: "#000" }} className="text-3xl font-bold mb-4">Helpdesk</h1>
                <p style={{ color: "#000" }} className="mb-8">Find help and support resources below or contact us directly.</p>

                <section className="contact-section">
                    <h2>Contact Us</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
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
                            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
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
                            <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
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
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Helpdesk;
