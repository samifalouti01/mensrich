import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import { jsPDF } from "jspdf";
import "bootstrap-icons/font/bootstrap-icons.css";
import Loader from '../components/Loader';
import "./Payments.css";

const Payments = () => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({});
  const [referrals, setReferrals] = useState([]);
  const [income, setIncome] = useState(0);
  const [currentTime, setCurrentTime] = useState(""); 
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      alert("Please log in.");
      return;
    }
  
    const currentUserId = String(currentUser.id);
    setUserId(currentUserId);
  
    const { data: userPpcgData, error: userPpcgError } = await supabase
      .from("history_data")
      .select("ppcg")
      .eq("id", currentUserId);
  
    if (userPpcgError) {
      console.error("Error fetching PPCG from history_data:", userPpcgError);
      return;
    }
  
    const totalPpcg = userPpcgData.reduce((acc, record) => acc + (parseFloat(record.ppcg) || 0), 0);
  
    const { data: userData, error: userError } = await supabase
      .from("user_data")
      .select("id, parrain_id, parainage_users, perso")
      .eq("id", currentUserId)
      .single();
  
    if (!userError) {
      const userLevel = determineLevel(totalPpcg);
      const userStatus = calculateUserStatus(parseFloat(userData.perso) || 0, userLevel);
  
      setUserData({ ...userData, ppcg: totalPpcg, userLevel, userStatus });
    } else {
      console.error("Error fetching user data:", userError);
    }
    setIsLoading(false);
  }, []);  

  const fetchReferrals = useCallback(async () => {
    if (!userId) return;

    const { data: userData, error: userError } = await supabase
      .from("user_data")
      .select("id, name, parrain_id, perso");

    if (userError) {
      console.error("Error fetching referrals:", userError);
      return;
    }

    const filteredReferrals = userData?.filter((user) => {
      const parrainIds = user.parrain_id
        ? user.parrain_id.split(",").map((id) => id.trim())
        : [];
      return parrainIds.includes(userId);
    }) || [];

    const referralsWithDetails = await Promise.all(
      filteredReferrals.map(async (referral) => {
        const { data: ppcgData, error: ppcgError } = await supabase
          .from("history_data")
          .select("ppcg")
          .eq("id", referral.id);

        if (ppcgError) {
          console.error(`Error fetching PPCG for referral ${referral.id}:`, ppcgError);
          return { ...referral, ppcg: 0 };
        }

        const totalPpcg = ppcgData.reduce((acc, record) => acc + (parseFloat(record.ppcg) || 0), 0);
        return { ...referral, ppcg: totalPpcg };
      })
    );

    console.log("Referral Details:", referralsWithDetails);

    setReferrals(referralsWithDetails);
  }, [userId]);

  const calculateIncome = useCallback(() => {
    if (!userData.id || referrals.length === 0) return;

    const userLevel = determineLevel(parseFloat(userData.ppcg) || 0);
    let totalIncome = 0;

    const updatedReferrals = referrals.map((referral) => {
      const referralPpcg = parseFloat(referral.perso) || 0;
      const referralLevel = determineLevel(referral.ppcg);
      const commission = getCommission(userLevel, referralLevel);

      const referralIncome = (commission / 100) * (isNaN(referral.perso) || referral.perso <= 0 ? 0 : parseFloat(referral.perso));
      totalIncome += referralIncome;

      return { ...referral, referralIncome, referralLevel };
    });

    setReferrals(updatedReferrals);
    setIncome(totalIncome.toFixed(2));
  }, [userData, referrals]);

  const determineLevel = (points) => {
    if (isNaN(points)) return "Distributeur";
    if (points >= 50000) return "Manager Senior";
    if (points >= 30000) return "Manager Junior";
    if (points >= 18700) return "Manager";
    if (points >= 12500) return "Animateur Senior";
    if (points >= 6250) return "Animateur Junior";
    if (points >= 100) return "Animateur";
    return "Distributeur";
  };

  const getCommission = (userLevel, referralLevel) => {
    const commissionMatrix = {
      "Manager Senior": {
        "Manager Senior": 0,
        "Manager Junior": 2,
        Manager: 4,
        "Animateur Senior": 6,
        "Animateur Junior": 8,
        Animateur: 10,
        Distributeur: 0,
      },
      "Manager Junior": {
        "Manager Senior": 0,
        "Manager Junior": 0,
        Manager: 2,
        "Animateur Senior": 4,
        "Animateur Junior": 6,
        Animateur: 8,
        Distributeur: 0,
      },
      Manager: {
        "Manager Senior": 0,
        "Manager Junior": 0,
        Manager: 0,
        "Animateur Senior": 2,
        "Animateur Junior": 4,
        Animateur: 6,
        Distributeur: 0,
      },
      "Animateur Senior": {
        "Manager Senior": 0,
        "Manager Junior": 0,
        Manager: 0,
        "Animateur Senior": 0,
        "Animateur Junior": 2,
        Animateur: 4,
        Distributeur: 0,
      },
      "Animateur Junior": {
        "Manager Senior": 0,
        "Manager Junior": 0,
        Manager: 0,
        "Animateur Senior": 0,
        "Animateur Junior": 0,
        Animateur: 2,
        Distributeur: 0,
      },
      Animateur: {
        "Manager Senior": 0,
        "Manager Junior": 0,
        Manager: 0,
        "Animateur Senior": 0,
        "Animateur Junior": 0,
        Animateur: 0,
        Distributeur: 0,
      },
      Distributeur: {
        "Manager Senior": 0,
        "Manager Junior": 0,
        Manager: 0,
        "Animateur Senior": 0,
        "Animateur Junior": 0,
        Animateur: 0,
        Distributeur: 0,
      },
    };

    return commissionMatrix[userLevel]?.[referralLevel] || 0;
  };

  const downloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
  
    doc.html(document.querySelector(".payments-container"), {
      callback: function (doc) {
        doc.save("payments-details.pdf");
      },
      margin: [5, 5, 5, 5],
      x: 5,
      y: 10,
      html2canvas: {
        scale: 0.2,
        dpi: 300,
        letterRendering: true,
        width: 1500,
        height: 2100
      }
    });
  };
  
  const getCurrentTime = () => {
    const date = new Date();
    
    // Format the month in Arabic
    const month = date.toLocaleString("ar", { month: "long" });
    
    // Format the time in Arabic
    const time = date.toLocaleTimeString("ar");
    
    // Format the full date in Arabic (day, month, year)
    const fullDate = date.toLocaleString("ar", { day: "numeric", month: "long", year: "numeric" });
    
    // Return the formatted string
    return `${fullDate} | ${time}`;
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userId) {
      fetchReferrals().then(calculateIncome);
    }
  }, [userId, fetchReferrals, calculateIncome]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateUserStatus = (perso, level) => {
    const thresholds = {
      "Manager Senior": 500,
      "Manager Junior": 400,
      Manager: 300,
      "Animateur Senior": 200,
      "Animateur Junior": 100,
    };
  
    return perso >= thresholds[level] ? "Actif" : "Inactif";
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
      <div className="payments-container">
      <button onClick={downloadPDF} className="download-btn">
          <i className="bi bi-file-earmark-arrow-down"></i>
          تنزيل ملف PDF
      </button>
          <div className="row-p">
              <p style={{ color: "#555" }}>{currentTime}</p>
              <p>
                  الحالة:{" "}
                  <span
                      style={{
                          color: userData.userStatus === "Actif" ? "green" : "red",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                      }}
                  >
                      <span
                          style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: userData.userStatus === "Actif" ? "green" : "red",
                          }}
                      ></span>
                      {userData.userStatus}
                  </span>
              </p>
          </div>
          <div className="user-info">
              <div className="row-p">
                  <h1>{userData.ppcg ? determineLevel(parseFloat(userData.ppcg)) : "Distribiteur"}</h1>
                  <h2>
                      <i className="bi bi-cash-coin" style={{ color: "#5700B4", marginLeft: "10px" }}></i>
                      {(income * 100).toFixed(2)} دج
                  </h2>
              </div>
              <p>نقاط مبيعاتك لهذا الشهر: <span style={{ color: "#5700B4", fontWeight: "bold" }}>{userData.perso}</span></p>
              <h3>حجم فريقك: {referrals.length}</h3>
          </div>
          <br />
          <h3>تفاصيل الإحالات:</h3>
          <ul className="referral-list">
              {referrals.map((referral) => (
                  <li key={referral.id} className="referral-item">
                      <span>{referral.name}</span>
                      <span>{determineLevel(referral.ppcg)}</span>
                      <span>الإيرادات: {((parseFloat(referral.referralIncome) || 0) * 100).toFixed(2)} دج</span>
                  </li>
              ))}
          </ul>
      </div>
    </div>
  );
};

export default Payments;
