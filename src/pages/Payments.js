import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import { jsPDF } from "jspdf";
import "bootstrap-icons/font/bootstrap-icons.css";
import Loader from "../components/Loader";
import { fetchUserData, fetchReferrals, fetchTeamEarnings } from "../services/supabaseService";
import { determineLevel, getCommission, calculateUserStatus, getThresholdForLevel, getMaxCommissionForLevel } from "../utils/commissionUtils";
import "./Payments.css";

const Payments = () => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({});
  const [referrals, setReferrals] = useState([]);
  const [income, setIncome] = useState(0);
  const [directCommission, setDirectCommission] = useState(0);
  const [teamEarnings, setTeamEarnings] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleFetchUserData = useCallback(() => {
    fetchUserData(
      setUserId,
      setUserData,
      setDirectCommission,
      setIncome,
      setIsLoading,
      calculateUserStatus,
      determineLevel,
      getCommission
    ).then(() => {
      if (userId) {
        fetchTeamEarnings(userId, determineLevel(userData.ppcg), determineLevel, getCommission).then((earnings) =>
          setTeamEarnings(earnings)
        );
      }
    });
  }, [userId, userData.ppcg]);

  const handleFetchReferrals = useCallback(() => {
    fetchReferrals(userId, userData.ppcg, setReferrals, determineLevel, getCommission);
  }, [userId, userData.ppcg]);

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
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
        height: 2100,
      },
    });
  };

  const getCurrentTime = () => {
    const date = new Date();
    const month = date.toLocaleString("ar", { month: "long" });
    const time = date.toLocaleTimeString("ar");
    const fullDate = date.toLocaleString("ar", { day: "numeric", month: "long", year: "numeric" });
    return `${fullDate} | ${time}`;
  };

  useEffect(() => {
    handleFetchUserData();
  }, [handleFetchUserData]);

  useEffect(() => {
    if (userId) {
      handleFetchReferrals();
    }
  }, [userId, handleFetchReferrals]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
          <h1>
            {userData.ppcg ? determineLevel(parseFloat(userData.ppcg)) : "Distributeur"} 
            {userData.ppcg && ` (${getMaxCommissionForLevel(determineLevel(parseFloat(userData.ppcg)))}%)`}
          </h1>
            <h2>
              <i className="bi bi-cash-coin" style={{ color: "#5700B4", marginLeft: "10px" }}></i>
              {(income * 100 || 0).toFixed(2)} دج
            </h2>
          </div>
          <p>
            نقاط مبيعاتك لهذا الشهر:{" "}
            <span style={{ color: "#5700B4", fontWeight: "bold" }}>
              {userData.perso || 0}
              {userData.ppcg && userData.userStatus === "Inactif" && ` (تحتاج ${getThresholdForLevel(determineLevel(parseFloat(userData.ppcg))) - (userData.perso || 0)} نقاط لتكون نشطًا)`}
            </span>
          </p>
          <p>
            أرباح فريقك:{" "}
            <span style={{ color: "#5700B4", fontWeight: "bold" }}>{(teamEarnings * 100).toFixed(2)} دج</span>
          </p>
          <h3>حجم فريقك: {referrals.length}</h3>
        </div>
        <br />
        <h3>تفاصيل الإحالات:</h3>
        <ul className="referral-list">
          {referrals.map((referral) => (
            <li key={referral.id} className="referral-item">
              <span>{referral.name || "Unnamed"}</span>
              <span>{determineLevel(referral.ppcg)}</span>
              <span>الإيرادات: {(referral.referralIncome * 100 || 0).toFixed(2)} دج</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Payments;