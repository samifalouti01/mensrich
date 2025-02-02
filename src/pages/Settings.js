import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Edit2, Save, X } from "lucide-react";
import Header from "../components/Header";
import Loader from '../components/Loader';
import "./Settings.css";

const SettingsField = ({ label, value, onSave, type = "text", placeholder = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className="settings-field">
      <div className="settings-field-header">
        <span className="settings-field-label">{label}</span>
        {!isEditing ? (
          <button 
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="button-icon" />
          </button>
        ) : (
          <div className="button-group">
            <button 
              className="save-button"
              onClick={handleSave}
            >
              <Save className="button-icon" />
            </button>
            <button 
              className="cancel-button"
              onClick={handleCancel}
            >
              <X className="button-icon" />
            </button>
          </div>
        )}
      </div>
      {!isEditing ? (
        <p className="settings-field-value">
          {value || <span className="empty-value">Not set</span>}
        </p>
      ) : (
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="settings-input"
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

const Settings = () => {
  const [userData, setUserData] = useState({
    email: "",
    phone: "",
    rip: "",
    identifier: "",
    name: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      const fetchUserData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("user_data")
          .select("email, phone, rip, identifier, name")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else {
          setUserData(data);
        }
        setIsLoading(false);
      };
      fetchUserData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleUpdate = async (field, value) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      setMessage("User not logged in.");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_data")
        .update({ [field]: value })
        .eq("id", user.id);

      if (error) {
        setMessage("Error updating details");
      } else {
        setMessage("Details updated successfully!");
        setUserData(prev => ({ ...prev, [field]: value }));
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Update failed:", error);
      setMessage("Something went wrong while updating.");
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
    <div className="settings-page">
      <Header />
      <div className="settings-container">
        <div className="settings-card">
          <div className="settings-header">
            <h2 className="settings-title">Account Settings</h2>
          </div>
          <div className="settings-content">
            {message && (
              <div className="message">
                {message}
              </div>
            )}
            <SettingsField
              label="Name"
              value={userData.name}
              onSave={(value) => handleUpdate("name", value)}
            />
            <SettingsField
              label="Email"
              value={userData.email}
              onSave={(value) => handleUpdate("email", value)}
              type="email"
            />
            <SettingsField
              label="Username"
              value={userData.identifier}
              onSave={(value) => handleUpdate("identifier", value)}
            />
            <SettingsField
              label="Phone"
              value={userData.phone}
              onSave={(value) => handleUpdate("phone", value)}
            />
            <SettingsField
              label="RIP"
              value={userData.rip}
              onSave={(value) => handleUpdate("rip", value)}
              placeholder="RIP: 007 99999 0021212121"
            />
            <SettingsField
              label="Password"
              value="********"
              onSave={(value) => handleUpdate("password", value)}
              type="password"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;