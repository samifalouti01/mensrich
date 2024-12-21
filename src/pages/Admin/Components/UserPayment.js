import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import "./UserPayment.css";

const UserPayment = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const determineLevel = (ppcg) => {
    if (!ppcg || isNaN(ppcg)) return "Distributeur";
    if (ppcg >= 30000) return "Manager";
    if (ppcg >= 18700) return "Manager Adjoint";
    if (ppcg >= 6250) return "Animateur";
    if (ppcg >= 100) return "Animateur Adjoint";
    return "Distributeur";
  };

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

  const calculateIncome = (userLevel, teamMembers) => {
    let totalIncome = 0;

    teamMembers.forEach((member) => {
      const teamLevel = determineLevel(member.ppcg);
      const commission = commissionMatrix[userLevel]?.[teamLevel] || 0;
      totalIncome += (member.ppcg * commission) / 100;
    });

    return totalIncome;
  };

  const fetchUsers = async () => {
    setLoading(true);
  
    try {
      // Fetch user data from `user_data` table
      const { data: userData, error: userError } = await supabase
        .from("user_data")
        .select("*");
  
      if (userError) throw userError;
  
      // Fetch `ppcg` from `history_data`
      const { data: historyData, error: historyError } = await supabase
        .from("history_data")
        .select("id, ppcg");
  
      if (historyError) throw historyError;
  
      // Create a lookup for ppcg by id
      const ppcgLookup = historyData.reduce((acc, record) => {
        acc[record.id] = record.ppcg;
        return acc;
      }, {});
  
      // Process users
      const processedUsers = userData.map((user) => {
        const userStatus = user.perso && parseFloat(user.perso) >= 100 ? "actif" : "inactif";
        const teamMembers = userData.filter(
          (u) => u.parrain_id && u.parrain_id.split(",").includes(String(user.id))
        );
        const userLevel = determineLevel(ppcgLookup[user.id] || 0); // Use `ppcg` from history_data
        const totalIncome = calculateIncome(userLevel, teamMembers);
  
        return {
          ...user,
          level: userLevel,
          totalIncome,
          teamSize: teamMembers.length,
          status: userStatus,
        };
      });
  
      setUsers(processedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const filteredUsers = users.filter((user) => {
    return statusFilter === "all" || user.status === statusFilter;
  });

  return (
    <div>
      <div className="payments-container">
        <h1 style={{ color: "black" }}>User Payments</h1>
        <div className="sort-buttons">
          <button onClick={() => handleStatusFilter("actif")}>Actif</button>
          <button onClick={() => handleStatusFilter("inactif")}>Inactif</button>
          <button onClick={() => handleStatusFilter("all")}>All</button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th style={{ color: "black" }}>ID</th>
                <th style={{ color: "black" }}>Name</th>
                <th style={{ color: "black" }}>Phone</th>
                <th style={{ color: "black" }}>RIP</th>
                <th style={{ color: "black" }}>Level</th>
                <th style={{ color: "black" }}>Total Income (DA)</th>
                <th style={{ color: "black" }}>Team Size</th>
                <th style={{ color: "black" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>{user.rip}</td>
                  <td>{user.level}</td>
                  <td>{user.totalIncome * 100} DA</td>
                  <td>{user.teamSize}</td>
                  <td
                    className={user.status === "actif" ? "active-status" : "inactive-status"}
                  >
                    {user.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserPayment;
