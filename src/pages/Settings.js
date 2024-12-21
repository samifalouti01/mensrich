import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaSave } from "react-icons/fa";
import Header from "../components/Header";
import "./Settings.css";

const Settings = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rip, setRip] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch current user data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      const fetchUserData = async () => {
        const { data, error } = await supabase
          .from("user_data")
          .select("email, phone, rip")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else {
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setRip(data.rip || "");
        }
      };
      fetchUserData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleUpdate = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      setMessage("User not logged in.");
      return;
    }

    try {
      const updates = {};
      if (email) updates.email = email;
      if (phone) updates.phone = phone;
      if (rip) updates.rip = rip;
      if (password) updates.password = password; 

      const { error } = await supabase
        .from("user_data")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        setMessage("Error updating details");
      } else {
        setMessage("Details updated successfully!");
      }
    } catch (error) {
      console.error("Update failed:", error);
      setMessage("Something went wrong while updating.");
    }
  };

  return (
    <div>
        <Header />
    <div className="settings-container">
      <h2>Update Your Information</h2>
      <div className="settings-form">
        <div className="input-group">
          <label>Email:</label>
          <input
            type="email"
            className="parrain-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div className="input-group">
          <label>Phone:</label>
          <input
            type="text"
            className="parrain-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>
        <div className="input-group">
            <label>RIp:</label>
            <input
              type="text"
              className="parrain-input"
              value={rip}
              onChange={(e) => setRip(e.target.value)}
              placeholder="Enter your RIP"
            />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input
            type="password"
            className="parrain-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>
        <button onClick={handleUpdate} className="save-btn">
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaSave style={{ marginRight: "5px" }} />
          <span>Save</span>
        </div>
        </button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
    </div>
  );
};

export default Settings;
