import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import { jsPDF } from "jspdf";
import "./Payments.css";

const Payments = () => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({});
  const [referrals, setReferrals] = useState([]);
  const [income, setIncome] = useState(0);
  const [currentTime, setCurrentTime] = useState(""); // Add state for current time

  const fetchUserData = useCallback(async () => {
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
      .select("id, parrain_id, parainage_users")
      .eq("id", currentUserId)
      .single();

    if (!userError) {
      setUserData({ ...userData, ppcg: totalPpcg });
    } else {
      console.error("Error fetching user data:", userError);
    }
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
    const month = date.toLocaleString("default", { month: "long" });
    const time = date.toLocaleTimeString();
    return `${month} ${date.getFullYear()} | ${time}`;
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

  return (
    <div>
      <Header />
      <button onClick={downloadPDF} className="download-btn">Download PDF</button>
      <div className="payments-container">
        <p style={{ color: "#333" }}>{currentTime}</p> {/* Display the current time */}
        <div className="user-info">
          <h1>Level: {userData.ppcg ? determineLevel(parseFloat(userData.ppcg)) : "N/A"}</h1>
          <h2>Total Income: {(income * 100).toFixed(2)} DA</h2>
          <h2>Team Size: {referrals.length}</h2>
        </div>
        <h3 style={{ color: "#333" }}>Referral Details:</h3>
        <ul className="referral-list">
          {referrals.map((referral) => (
            <li key={referral.id} className="referral-item">
              <span>{referral.name}</span>
              <span>Level: {determineLevel(referral.ppcg)}</span>
              <span>perso: {((parseFloat(referral.perso) || 0) * 100).toFixed(2)}</span>
              <span>Income: {((parseFloat(referral.referralIncome) || 0) * 100).toFixed(2)} DA</span>
            </li>          
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Payments;
