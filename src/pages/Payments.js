import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the autotable plugin
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

  const fetchAmiriFont = async () => {
    const fontUrl = "https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUp.ttf"; // Amiri Regular 400
    const response = await fetch(fontUrl);
    const fontData = await response.arrayBuffer();
    return new Uint8Array(fontData);
  };

  const downloadPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");

    try {
      // Fetch and add the Amiri font dynamically
      const fontBytes = await fetchAmiriFont();
      const fontBase64 = btoa(String.fromCharCode(...fontBytes));
      doc.addFileToVFS("Amiri-Regular.ttf", fontBase64);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri");
      console.log("Available fonts:", doc.getFontList());
    } catch (error) {
      console.error("Font loading failed:", error);
      doc.setFont("Helvetica"); // Fallback
    }

    // Set font size and language (RTL for Arabic if needed, but we'll use LTR for English)
    doc.setFontSize(12);
    doc.setLanguage("en"); // Set to English for LTR

    let yPosition = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = 10;

    // Title
    doc.text("Payment Details", leftMargin, yPosition);
    yPosition += 10;

    // Current time (translated to English format)
    const date = new Date();
    const englishTime = date.toLocaleString("en", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    doc.text(`Date: ${englishTime}`, leftMargin, yPosition);
    yPosition += 10;

    // User Info Table
    const userInfoData = [
      ["Status", userData.userStatus || "Unknown"],
      ["Level", userData.ppcg ? `${determineLevel(parseFloat(userData.ppcg))} (${getMaxCommissionForLevel(determineLevel(parseFloat(userData.ppcg)))}%)` : "Distributor"],
      ["Income", `${(income * 100 || 0).toFixed(2)} DZD`],
      ["Personal Points This Month", userData.perso || 0],
      ["Team Earnings", `${(teamEarnings * 100).toFixed(2)} DZD`],
      ["Team Size", referrals.length],
    ];

    if (userData.ppcg && userData.userStatus === "Inactif") {
      userInfoData[3][1] += ` (Needs ${getThresholdForLevel(determineLevel(parseFloat(userData.ppcg))) - (userData.perso || 0)} points to be active)`;
    }

    doc.autoTable({
      startY: yPosition,
      head: [["Field", "Value"]],
      body: userInfoData,
      theme: "grid",
      styles: { font: "Amiri", halign: "left" },
      headStyles: { fillColor: [87, 0, 180] }, // Purple header
      margin: { left: leftMargin, right: leftMargin },
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Referrals Table
    doc.text("Referral Details", leftMargin, yPosition);
    yPosition += 10;

    const referralData = referrals.map((referral) => [
      referral.name || "Unnamed",
      determineLevel(referral.ppcg),
      `${(referral.referralIncome * 100 || 0).toFixed(2)} DZD`,
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [["Name", "Level", "Revenue"]],
      body: referralData,
      theme: "grid",
      styles: { font: "Amiri", halign: "left" },
      headStyles: { fillColor: [87, 0, 180] },
      margin: { left: leftMargin, right: leftMargin },
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Calculate Total Income
    const totalIncome = (income * 100 || 0);
    doc.text(`Total Income: ${totalIncome.toFixed(2)} DZD`, leftMargin, yPosition);

    // Save the PDF
    doc.save("payments-details.pdf");
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
              {userData.userStatus || "غير معروف"}
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