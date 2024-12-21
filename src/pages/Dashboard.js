import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { FaTimes, FaUserPlus, FaCartPlus, FaPlus, FaCopy } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import Parrain from "../components/Parrain";
import "react-circular-progressbar/dist/styles.css";
import { useUser } from "../components/UserContext";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { level, calculateLevel, totalPoints, nextLevel, levelProgress, pointsToNextLevel } = useUser();
  const [message, setMessage] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [perso, setPerso] = useState("");
  const [parainagePoints, setParainagePoints] = useState("");
  const [parainageUsers, setParainageUsers] = useState("");
  const [ppcg, setPpcg] = useState(0);
  const [userImage, setUserImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showParrain, setShowParrain] = useState(false);
  const parrainModalRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showButtons, setShowButtons] = useState(false);
  

  const fetchUserData = useCallback(async (userId) => {
    const { data: userData, error: userError } = await supabase
      .from("user_data")
      .select("id, user_image, identifier, name, perso, parainage_points, parainage_users, ppcg")
      .eq("id", userId)
      .single();

    if (userError) {
      console.userError("Error fetching user data:", userError);
    } else {
      setIdentifier(userData.identifier);
      setName(userData.name);
      setPerso(userData.perso);
      setParainagePoints(userData.parainage_points);
      setParainageUsers(userData.parainage_users);
      setPpcg(userData.ppcg);
      setUserImage(userData.user_image);
    }

    const { data: historyData, error: historyError } = await supabase
      .from("history_data")
      .select("perso, parainage_points, ppcg")
      .eq("id", userId)
      .single();

    if (historyError) {
      console.historyError("Error fetching user data:", historyError);
    } else {
      const total = Number(historyData.ppcg || 0);
      calculateLevel(total); 
    }
  }, [calculateLevel]);

  console.log(userImage);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      fetchUserData(user.id);
    } else {
      navigate("/login");
    }
  }, [fetchUserData, navigate]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setMessage("Text copied to clipboard!");
        setTimeout(() => setMessage(""), 2000);
      })
      .catch((err) => {
        setMessage("Failed to copy text: " + err);
        setTimeout(() => setMessage(""), 2000);
      });
  };

  const openParrainModal = () => setShowParrain(true);
  const closeParrainModal = () => setShowParrain(false);

  const handleImageUpload = async (file) => {
    setIsUploading(true);
    setMessage('Uploading...');
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        setMessage("User not logged in.");
        return;
      }

      // Step 1: Clear current image
      await supabase.from("user_data").update({ user_image: null }).eq("id", user.id);

      // Step 2: Upload the new image
      const fileName = `${user.id}-${Date.now()}-${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("user_pic")
        .upload(fileName, file);

      if (storageError) {
        setMessage("Failed to upload image.");
        return;
      }

      // Step 3: Get public URL and update user image
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

    // Simulate upload progress
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

  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        // Fetch start and end times from the challenge table
        const { data, error } = await supabase
          .from('challenge')
          .select('start, end')
          .single(); // Assuming there's only one challenge
  
        if (error) {
          console.error("Error fetching challenge data:", error);
          return;
        }
  
        if (data && data.end) {
          const endDate = new Date(data.end);
  
          const calculateTimeLeft = () => {
            const now = new Date();
            const difference = endDate - now;
  
            if (difference <= 0) {
              return '00j 00h 00m 00s'; // Countdown is over
            }
  
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
  
            return `${days}j ${hours}h ${minutes}m ${seconds}s`;
          };
  
          const updateCountdown = () => {
            setTimeLeft(calculateTimeLeft());
          };
  
          updateCountdown(); // Initial calculation
          const timer = setInterval(updateCountdown, 1000); // Update every second
  
          return () => clearInterval(timer); // Clean up the interval
        }
      } catch (error) {
        console.error("Unexpected error fetching challenge data:", error);
      }
    };
  
    fetchChallengeData();
  }, []);

  const toggleButtons = () => {
    setShowButtons((prev) => !prev);
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <Header />
        <div className="banner">
          <span className="countdown"><p className="countdown">Challenge se termine dans</p>{timeLeft}</span>
        </div>
        <div className="float-container">
          <button className="plus-button" onClick={toggleButtons}>
            {showButtons ? <FaTimes /> : <FaPlus />}
          </button>

          {showButtons && (
            <div className="float">
              <button className="bouncy-button" onClick={openParrainModal}>
                <FaUserPlus /> Parrainer
              </button>
              <button className="bouncy-button" onClick={() => navigate("/boutique")}>
                <FaCartPlus /> Nouvelle Commande
              </button>
            </div>
          )}
        </div>
        <div className="dashboard-main">
          <div className="column">
            <div className="dashboard-card">
              <div onClick={() => document.getElementById('file-input').click()}>
                <div className="card-image">
                  <img src={userImage || "Loading..."} alt="ْ" className="hidden-alt" />
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
              <h1>{name || "Loading..."}</h1>
              <h2 style={{ color: "#9A9A9A", fontWeight: "medium" }}>{level || "Loading..."}</h2>
              <div className="copy-container">
                <div className="copy-text">
                <p>{identifier || "Loading..."}</p>
                <FaCopy style={{ color: '#000', padding: '0' }} onClick={() => handleCopy(identifier)} />
                </div>
              </div>
              {message && (
                <p style={{ marginTop: "10px", fontSize: "14px", color: "#28a745", fontWeight: "bold" }}>
                  {message}
                </p>
              )}
            </div>
          </div>
          <div className="wrap">
            <div className="dashboard-card">
              <div className="flex-container">
                <h3>Sales points:</h3>
                <p>{perso || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>Referral points:</h3>
                <p>{parainagePoints || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>Referred Users:</h3>
                <p>{parainageUsers || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>Group points:</h3>
                <p>{ppcg || "Loading..."}</p>
              </div>
            </div>
            <div className="dashboard-card">
              <h2>
                Progress to Next Level: <span style={{ color: "#5700B4" }}>{nextLevel}</span>
              </h2>
              <div className="donut-container">
                <CircularProgressbar
                  value={levelProgress}
                  text={`${levelProgress.toFixed(1)}%`}
                  styles={buildStyles({
                    textColor: "#5700B4",
                    pathColor: "#5700B4",
                    trailColor: "#d3d3d3",
                  })}
                />
              </div>
              <h3>{level}</h3>
              <p>Total Points: {totalPoints}</p>
              <p>
                Points needed to reach <span style={{ color: "#5700B4" }}>{nextLevel}</span>:{" "}
                {pointsToNextLevel}
              </p>
            </div>
            <div className="dashboard-card">
            <img src="https://wekxcgoqkxqisrdmgvkp.supabase.co/storage/v1/object/public/user_pic/Hotel%205%20etoiles.gif?t=2024-11-28T01%3A36%3A20.432Z" alt="challenge" className="challenge" />
          </div>
          </div>
        </div>
      </div>
      {showParrain && <Parrain ref={parrainModalRef} onClose={closeParrainModal} />}
    </div>
  );
};

export default Dashboard;
