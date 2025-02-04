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
    birthdate: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);  // Defined here
  const [uploadProgress, setUploadProgress] = useState(0); // Defined here
  const [userImage, setUserImage] = useState(null); // Defined here
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      const fetchUserData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("user_data")
          .select("email, phone, rip, identifier, name, birthdate, user_image")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else {
          setUserData(data);
          setUserImage(data.user_image); // Set user image from fetched data
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

  const handleImageUpload = async (file) => {
    setIsUploading(true);
    setMessage('Uploading...');
    try {
      const user = JSON.parse(localStorage.getItem("user"));
  
      if (!user || !user.id) {
        setMessage("User not logged in.");
        return;
      }
  
      await supabase.from("user_data").update({ user_image: null }).eq("id", user.id);
  
      const fileName = `${user.id}-${Date.now()}-${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("user_pic")
        .upload(fileName, file);
  
      if (storageError) {
        setMessage("Failed to upload image.");
        return;
      }
  
      const { data: publicURLData, error: publicURLError } = supabase.storage
        .from("user_pic")
        .getPublicUrl(fileName);
  
      if (publicURLError) {
        setMessage("Failed to get public URL.");
        return;
      }
  
      const newImageUrl = publicURLData.publicUrl;
      await supabase.from("user_data").update({ user_image: newImageUrl }).eq("id", user.id);
      setUserImage(newImageUrl);
      setMessage("Image updated successfully!");
    } catch (error) {
      setMessage("Something went wrong.");
    }
  
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev < 100) return prev + 10;
        clearInterval(uploadInterval);
        setMessage('Upload Complete');
        setIsUploading(false);
        return 100;
      });
    }, 500);
  
    setTimeout(() => setUserImage(URL.createObjectURL(file)), 3000);
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
            <h2 className="settings-title">إعدادات الحساب</h2>
          </div>
          <div className="settings-content">
            <div onClick={() => document.getElementById('file-input').click()}>
              <div className="card-image">
                <img src={userImage || "جار التحميل..."} alt="المستخدم" className="hidden-alt" />
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files[0];
                  if (file) {
                    await handleImageUpload(file);
                  }
                }}
                style={{ display: "none" }}
              />
              {isUploading && <progress value={uploadProgress} max="100"></progress>}
            </div>
            {message && (
              <div className="message">
                {message}
              </div>
            )}
            <SettingsField
              label="الاسم"
              value={userData.name}
              onSave={(value) => handleUpdate("name", value)}
            />
            <SettingsField
              label="البريد الإلكتروني"
              value={userData.email}
              onSave={(value) => handleUpdate("email", value)}
              type="email"
            />
            <SettingsField
              label="اسم المستخدم"
              value={userData.identifier}
              onSave={(value) => handleUpdate("identifier", value)}
            />
            <SettingsField
              label="الهاتف"
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
              label="كلمة المرور"
              value="********"
              onSave={(value) => handleUpdate("password", value)}
              type="password"
            />
            <SettingsField
              label="تاريخ الميلاد"
              value={userData.birthdate || ""}
              onSave={(value) => handleUpdate("birthdate", value)}
              type="date"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
