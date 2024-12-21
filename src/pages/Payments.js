import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import "./Payments.css";

const Payments = () => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({});
  const [referrals, setReferrals] = useState([]);
  const [income, setIncome] = useState(0);

  const fetchUserData = useCallback(async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      alert("Please log in.");
      return;
    }
  
    const currentUserId = String(currentUser.id);
    setUserId(currentUserId);
  
    // Fetch aggregated PPCG from history_data
    const { data: userPpcgData, error: userPpcgError } = await supabase
      .from("history_data")
      .select("ppcg")
      .eq("id", currentUserId);
  
    if (userPpcgError) {
      console.error("Error fetching PPCG from history_data:", userPpcgError);
      return;
    }
  
    const totalPpcg = userPpcgData.reduce((acc, record) => acc + (parseFloat(record.ppcg) || 0), 0);
  
    // Fetch additional user details from user_data
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

    const { data, error } = await supabase
      .from("user_data")
      .select("id, name, ppcg, parrain_id");

    if (error) return;

    const filteredReferrals = data?.filter((user) => {
      const parrainIds = user.parrain_id
        ? user.parrain_id.split(",").map((id) => id.trim())
        : [];
      return parrainIds.includes(userId);
    }) || [];

    setReferrals(filteredReferrals);
  }, [userId]);

  const calculateIncome = useCallback(() => {
    if (!userData.id || referrals.length === 0) return;

    const userLevel = determineLevel(parseFloat(userData.ppcg) || 0);
    let totalIncome = 0;

    const updatedReferrals = referrals.map((referral) => {
      const referralPpcg = parseFloat(referral.ppcg) || 0;
      const referralLevel = determineLevel(referralPpcg);
      const commission = getCommission(userLevel, referralLevel);

      const referralIncome = (commission / 100) * referralPpcg;
      totalIncome += referralIncome;

      return { ...referral, referralIncome };
    });

    setReferrals(updatedReferrals);
    setIncome(totalIncome.toFixed(2));
  }, [userData, referrals]);

  const determineLevel = (points) => {
    if (isNaN(points)) return "Distributeur";
    if (points >= 30000) return "Manager";
    if (points >= 18700) return "Manager Adjoint";
    if (points >= 6250) return "Animateur";
    if (points >= 100) return "Animateur Adjoint";
    return "Distributeur";
  };

  const getCommission = (userLevel, referralLevel) => {
    const commissionMatrix = {
      Manager: {
        Manager: 0,
        "Manager Adjoint": 5,
        Animateur: 10,
        "Animateur Adjoint": 13,
      },
      "Manager Adjoint": {
        Manager: 0,
        "Manager Adjoint": 0,
        Animateur: 3,
        "Animateur Adjoint": 8,
      },
      Animateur: {
        Manager: 0,
        "Manager Adjoint": 0,
        Animateur: 0,
        "Animateur Adjoint": 5,
      },
      "Animateur Adjoint": {
        Manager: 0,
        "Manager Adjoint": 0,
        Animateur: 0,
        "Animateur Adjoint": 0,
      },
    };

    return commissionMatrix[userLevel]?.[referralLevel] || 0;
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userId) {
      fetchReferrals().then(calculateIncome);
    }
  }, [userId, fetchReferrals, calculateIncome]);

  return (
    <div>
      <Header />
      <div className="payments-container">
        <div className="user-info">
          <h1>Level: {userData.ppcg ? determineLevel(parseFloat(userData.ppcg)) : "N/A"}</h1>
          <h2>Total Income: {income * 100} DA</h2>
          <h2>Team Size: {referrals.length}</h2>
        </div>
        <h3 style={{ color: "black"}}>Referral Details:</h3>
        <ul className="referral-list">
          {referrals.map((referral) => (
            <li key={referral.id} className="referral-item">
              <span>{referral.name}</span>
              <span>PCG: {referral.ppcg || "N/A"}</span>
              <span>
                Income: {referral.referralIncome ? (referral.referralIncome * 100).toFixed(2) : "0.00" * 100} DA
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Payments;
