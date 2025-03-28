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
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { calculateLevel } = useUser();
  const { level, nextLevel, pointsToNextLevel } = useLevel();
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState("");
  const [phoneNotification, setPhoneNotification] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [perso, setPerso] = useState("");
  const [parainagePoints, setParainagePoints] = useState("");
  const [parainageUsers, setParainageUsers] = useState("");
  const [ppcg, setPpcg] = useState(0);
  const [userImage, setUserImage] = useState(null);
  const [showParrain, setShowParrain] = useState(false);
  const parrainModalRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showButtons, setShowButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyPpcg, setMonthlyPpcg] = useState(0);
  const [historyPpcg, setHistoryPpcg] = useState(0);
  const [challengeData, setChallengeData] = useState(null);
  
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
      .select("id, user_image, identifier, name, perso, parainage_points, parainage_users, ppcg, email, phone")
      .eq("id", userId)
      .single();

    if (userError) {
      console.userError("خطأ في استرجاع بيانات المستخدم:", userError);
    } else {
      setId(userData.id);
      setName(userData.name);
      setPerso(userData.perso);
      setParainagePoints(userData.parainage_points);
      setParainageUsers(userData.parainage_users);
      setPpcg(userData.ppcg);
      setUserImage(userData.user_image);

      if (!userData.email) {
        setNotification("يُرجى تحديث بريدك الإلكتروني");
      } else {
        setNotification("");
      }   
      
      if (!userData.phone) {
        setPhoneNotification("يُرجى تحديث رقم هاتفك.");
      } else {
        setPhoneNotification(""); 
      }   
    }

    const { data: historyData, error: historyError } = await supabase
      .from("user_data")
      .select("perso, parainage_points, ppcg")
      .eq("id", userId)
      .single();

    if (historyError) {
      console.historyError("خطأ في استرجاع بيانات المستخدم:", historyError);
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
      console.historyError("خطأ في استرجاع بيانات المستخدم:", levelError);
    } else {
      setHistoryPpcg(levelData.ppcg || 0);
    }

    const { data: monthlyData, error: monthlyError } = await supabase
      .from("first_month")
      .select("ppcg")
      .eq("id", userId)
      .single();

    if (monthlyError) {
      console.monthlyError("خطأ في استرجاع بيانات المستخدم:", monthlyError);
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
        setMessage("تم نسخ النص إلى الحافظة!");
        setTimeout(() => setMessage(""), 2000);
      })
      .catch((err) => {
        setMessage("فشل في نسخ النص: " + err);
        setTimeout(() => setMessage(""), 2000);
      });
  };

  const openParrainModal = () => setShowParrain(true);
  const closeParrainModal = () => setShowParrain(false);

  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        const { data, error } = await supabase
          .from('challenge')
          .select('start, end, image')
          .single();
  
        if (error) {
          console.error("خطأ في إحضار بيانات التحدي:", error);
          return;
        }
  
        if (data && data.end) {
          setChallengeData(data);
          const endDate = new Date(data.end);
  
          const calculateTimeLeft = () => {
            const now = new Date();
            const difference = endDate - now;
  
            if (difference <= 0) {
              return '00 يوم 00 ساعة 00 دقيقة 00 ثانية'; 
            }
  
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
  
            return `${days} يوم ${hours}سا ${minutes}د ${seconds}ثانية`;
          };

          const updateCountdown = () => {
            setTimeLeft(calculateTimeLeft());
          };
  
          updateCountdown(); 
          const timer = setInterval(updateCountdown, 1000); 
  
          return () => clearInterval(timer); 
        }
      } catch (error) {
        console.error("خطأ غير متوقع في إحضار بيانات التحدي:", error);
      }
    };
  
    fetchChallengeData();
  }, []);

  const toggleButtons = () => {
    setShowButtons((prev) => !prev);
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
        {notification && (
          <div className="notification">
            <p>{notification}</p>
            <button onClick={() => navigate("/settings")}>تحديث</button>
          </div>
        )}
        {phoneNotification && (
          <div className="notification">
            <p>{phoneNotification}</p>
            <button onClick={() => navigate("/settings")}>تحديث</button>
          </div>
        )}
        <div className="float-container">
          <button className="plus-button" onClick={toggleButtons}>
            {showButtons ? <FaTimes /> : <FaPlus />}
          </button>

          {showButtons && (
            <div className="float">
              <button className="bouncy-button" onClick={openParrainModal}>
                <i class="bi bi-person-add"></i>
              إحالة صديق
              </button>
              <button className="bouncy-button" onClick={() => navigate("/boutique")}>
                <i class="bi bi-shop"></i>
                المتجر
              </button>
            </div>
          )}
        </div>
        {/* Begin */}
        <div className="documentation-wrapper-dash">

        {/* Quick Links */}
        <div className="dash-links">
            <div className="first-card">
              <div>
                    <div className="card-image">
                      <img src={userImage || "Loading..."} alt="ْ" className="hidden-alt" />
                    </div>
              </div>
              <h2>{name || "Loading..."}</h2>
              <h4 style={{ color: "#0022b9" }}>{level || "Loading..."}</h4>
              <div className="copy-container">
                <div className="copy-text">
                  {historyPpcg >= 100 ? (
                    <>
                      <p style={{ color: "#5700B4" }}>ID: {id || "Loading..."}</p>
                      <i style={{ color: '#5700B4', padding: '0' }} onClick={() => handleCopy(id)} className="bi bi-copy"></i>
                    </>
                  ) : (
                    <p style={{ color: "#5700B4" }}>سيظل الـID مخفي حتى عندما تصل إلى مستوى Animateur.</p>
                  )}
                </div>
              </div>
              {message && (
                <p style={{ marginTop: "10px", fontSize: "14px", color: "#28a745", fontWeight: "bold" }}>
                  {message}
                </p>
              )}
            </div>

            <div className="first-card">
              <p>لهذا الشهر</p>
              <div className="flex-container">
                <h3>نقاط المبيعات:</h3>
                <p>{perso !== null && perso !== undefined ? perso : "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>نقاط الإحالة:</h3>
                <p>{parainagePoints || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>المستخدمون الذين تمت إحالتهم:</h3>
                <p>{parainageUsers || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>النقاط الجماعية:</h3>
                <p>{ppcg || "Loading..."}</p>
              </div>
            </div>
            <div className="first-card">
              <h2>
              الانتقال إلى المستوى التالي: <span style={{ color: "#5700B4" }}>{nextLevel}</span>
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
                <p>الشهر السابق: <span style={{ color: "#000", fontWeight: "bold" }}>{monthlyPpcg}</span></p>
                <p>هذا الشهر: <span style={{ color: "#000", fontWeight: "bold" }}>{ppcg}</span></p>
                <p>
                النقاط التي يجب أن تصل إليها: <span style={{ color: "#5700B4", fontWeight: "bold" }}>{nextLevel}</span>:{" "}
                  <span style={{ color: "#000", fontWeight: "bold" }}>{pointsToNextLevel}</span>
                </p>
            </div>
        </div>

        {/* User Guide Section */}
        <section className="doc-section-dash">
          <div className="section-header-dash">
            <i class="bi bi-trophy" style={{ marginLeft: '10px' }}></i>
            <h2>التحدي</h2>
          </div>
          <div className="section-content-dash">
            <div className="column-dash">
              <p>للفوز بهذا التحدي عليك اتباع الخطوات التالية:</p>
              <div className="feature-list">
                <div className="feature-item">
                  <i className="bi bi-check2-circle"></i>
                  <p>5 مستخدمين محالين نشطين</p>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check2-circle"></i>
                  <p>250 نقطة بيع</p>
                </div>
                <div className="feature-item">
                  <i class="bi bi-stopwatch" style={{ color: "red" }}></i>
                  <p>ينتهي التحدي في:<br /> <span style={{ color: "#5700B4" }}>{timeLeft}</span></p>
                </div>
              </div>
            </div>
            <img src={challengeData?.image || "Loading..."} alt="challenge" className="challenge" />
          </div>
        </section>

        {/* Payment Section */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-credit-card" style={{ marginLeft: '10px' }}></i>
            <h2>مدفوعاتك</h2>
          </div>
          <div className="section-content">
            <p>سوف تتقاضى راتبك وعمولتك شهرياً.</p>
            <div className="payment-grid">
              <div className="payment-card">
                <h3>الراتب</h3>
                <p><Pay /></p>
              </div>
              <div className="payment-card">
                <h3>العمولة</h3>
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
