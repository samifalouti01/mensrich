import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { FaTimes, FaPlus } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import Parrain from "../components/Parrain";
import "react-circular-progressbar/dist/styles.css";
import { useUser } from "../components/UserContext";
import { useLevel } from "../components/LevelContext";
import Pay from "../components/Pay";
import CommissionFetcher from '../components/CommissionFetcher';
import Loader from '../components/Loader';
import { getTranslation } from "../components/localization";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { calculateLevel } = useUser();
  const { level, nextLevel, pointsToNextLevel } = useLevel();
  const [message, setMessage] = useState("");
  const [id, setId] = useState("");
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
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyPpcg, setMonthlyPpcg] = useState(0);
  const [language, setLanguage] = useState("en")
  
  // Calculate total progress
  const totalProgress = Number(monthlyPpcg) + Number(ppcg);

  // Calculate progress as percentage
  const progressPercentage = (totalProgress / pointsToNextLevel) * 100;

  // Ensure percentage doesn't exceed 100%
  const result = progressPercentage > 100 ? 100 : progressPercentage;

  const fetchUserData = useCallback(async (userId) => {
    setIsLoading(true);
    const { data: userData, error: userError } = await supabase
      .from("user_data")
      .select("id, user_image, identifier, name, perso, parainage_points, parainage_users, ppcg")
      .eq("id", userId)
      .single();

    if (userError) {
      console.userError("Error fetching user data:", userError);
    } else {
      setId(userData.id);
      setName(userData.name);
      setPerso(userData.perso);
      setParainagePoints(userData.parainage_points);
      setParainageUsers(userData.parainage_users);
      setPpcg(userData.ppcg);
      setUserImage(userData.user_image);
    }

    const { data: historyData, error: historyError } = await supabase
      .from("user_data")
      .select("perso, parainage_points, ppcg")
      .eq("id", userId)
      .single();

    if (historyError) {
      console.historyError("Error fetching user data:", historyError);
    } else {
      const total = Number(historyData.ppcg || 0);
      calculateLevel(total); 
    }

    const { data: levelData, error: levelError } = await supabase
      .from("history_data")
      .select("perso, parainage_points, ppcg")
      .eq("id", userId)
      .single();

    if (levelError) {
      console.historyError("Error fetching user data:", levelError);
    }

    const { data: monthlyData, error: monthlyError } = await supabase
      .from("first_month")
      .select("ppcg")
      .eq("id", userId)
      .single();

    if (monthlyError) {
      console.monthlyError("Error fetching user data:", monthlyError);
    } else {
      const monthlyPpcg = monthlyData.ppcg || 0;
      setMonthlyPpcg(monthlyPpcg);
    }

    setIsLoading(false);
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

  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        const { data, error } = await supabase
          .from('challenge')
          .select('start, end')
          .single();
  
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
              return '00 jours 00h 00m 00s'; 
            }
  
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
  
            return `${days} jours ${hours}h ${minutes}m ${seconds}s`;
          };
  
          const updateCountdown = () => {
            setTimeLeft(calculateTimeLeft());
          };
  
          updateCountdown(); 
          const timer = setInterval(updateCountdown, 1000); 
  
          return () => clearInterval(timer); 
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

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const progressOptions = {
    strokeWidth: 4,
    color: "#5700B4",
    trailColor: "#d3d3d3",
    text: {
      value: `${result.toFixed(1)}%`,
      color: "#5700B4",
      fontSize: "20px",
    },
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader />
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <Header />
        <div className="float-container">
          <button className="plus-button" onClick={toggleButtons}>
            {showButtons ? <FaTimes /> : <FaPlus />}
          </button>

          {showButtons && (
            <div className="float">
              <button className="bouncy-button" onClick={openParrainModal}>
                <i class="bi bi-person-add" style={{ marginRight: "10px" }}></i>{getTranslation(language, "referral")}
              </button>
              <button className="bouncy-button" onClick={() => navigate("/boutique")}>
                <i class="bi bi-shop" style={{ marginRight: "10px" }}></i>{getTranslation(language, "store")}
              </button>
            </div>
          )}
        </div>
        {/* Begin */}
        <div className="documentation-wrapper-dash">

        {/* Quick Links */}
        <div className="dash-links">
            <div className="first-card">
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
              <br />
              <h4>{name || "Loading..."}</h4>
              <br />
              <h4>{level || "Loading..."}</h4>
              <br />
              <div className="copy-container">
                <div className="copy-text">
                  <p style={{ color: "#5700B4"}}>{getTranslation(language, "id")}: {id || "Loading..."}</p>
                  <i style={{ color: '#5700B4', padding: '0' }} onClick={() => handleCopy(id)} class="bi bi-copy"></i>
                </div>
              </div>
              {message && (
                <p style={{ marginTop: "10px", fontSize: "14px", color: "#28a745", fontWeight: "bold" }}>
                  {message}
                </p>
              )}
            </div>

            <div className="first-card">
              <p>{getTranslation(language, "forThisMonth")}</p>
              <div className="flex-container">
                <h3>{getTranslation(language, "salesPoints")}:</h3>
                <p>{perso || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>{getTranslation(language, "referralPoints")}:</h3>
                <p>{parainagePoints || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>{getTranslation(language, "referredUsers")}:</h3>
                <p>{parainageUsers || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>{getTranslation(language, "groupPoints")}:</h3>
                <p>{ppcg || "Loading..."}</p>
              </div>
            </div>
            <div className="first-card">
              <h2>
              {getTranslation(language, "Ptnl")}: <span style={{ color: "#5700B4" }}>{nextLevel}</span>
                </h2>
                <div className="donut-container">
                  <CircularProgressbar
                    value={result}
                    text={`${result.toFixed(1)}%`}
                    styles={buildStyles({
                      textColor: "#5700B4",
                      pathColor: "#5700B4",
                      trailColor: "#d3d3d3",
                    })}
                  />
                </div>
                <p>{getTranslation(language, "previousMonth")}: <span style={{ color: "#000", fontWeight: "bold" }}>{monthlyPpcg}</span></p>
                <p>{getTranslation(language, "thisMonth")}: <span style={{ color: "#000", fontWeight: "bold" }}>{ppcg}</span></p>
                <p>
                  {getTranslation(language, "pointsToReach")} <span style={{ color: "#5700B4", fontWeight: "bold" }}>{nextLevel}</span>:{" "}
                  <span style={{ color: "#000", fontWeight: "bold" }}>{pointsToNextLevel}</span>
                </p>
            </div>
        </div>

        {/* User Guide Section */}
        <section className="doc-section-dash">
          <div className="section-header-dash">
            <i class="bi bi-trophy"></i>
            <h2>{getTranslation(language, "Challenge")}</h2>
          </div>
          <div className="section-content-dash">
            <div className="column-dash">
              <p>{getTranslation(language, "challengeTitle")}:</p>
              <div className="feature-list">
                <div className="feature-item">
                  <i className="bi bi-check2-circle"></i>
                  <p>{getTranslation(language, "firstStep")}</p>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check2-circle"></i>
                  <p>{getTranslation(language, "secondStep")}</p>
                </div>
                <div className="feature-item">
                  <i class="bi bi-stopwatch" style={{ color: "red" }}></i>
                  <p>{getTranslation(language, "challengeDuration")}: <br /> <span style={{ color: "#5700B4" }}>{timeLeft}</span></p>
                </div>
              </div>
            </div>
            <img src="https://yyqugjxhmvdjsdlzuvlb.supabase.co/storage/v1/object/public/creative/Challenge.gif?t=2025-01-06T22%3A57%3A01.362Z" alt="challenge" className="challenge" />
          </div>
        </section>

        {/* Payment Section */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-credit-card"></i>
            <h2>{getTranslation(language, "payment")}</h2>
          </div>
          <div className="section-content">
            <p>{getTranslation(language, "paymentTitle")}</p>
            <div className="payment-grid">
              <div className="payment-card">
                <h3>{getTranslation(language, "salary")}</h3>
                <p><Pay /></p>
              </div>
              <div className="payment-card">
                <h3>{getTranslation(language, "commission")}</h3>
                {id && <CommissionFetcher userId={id} />}
              </div>
            </div>
          </div>
        </section>
        </div>
      </div>
      {showParrain && <Parrain ref={parrainModalRef} onClose={closeParrainModal} />}
      
    </div>
  );
};

export default Dashboard;
