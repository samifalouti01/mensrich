import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const determineLevel = (ppcg) => {
  if (!ppcg || isNaN(ppcg)) return "Distributeur";
  if (ppcg >= 50000) return "Manager Senior";
  if (ppcg >= 30000) return "Manager Junior";
  if (ppcg >= 18700) return "Manager";
  if (ppcg >= 12500) return "Animateur Senior";
  if (ppcg >= 6250) return "Animateur Junior";
  if (ppcg >= 100) return "Animateur";
  return "Distributeur";
};

const MonthlyUp = () => {
  const [userData, setUserData] = useState([]);
  const [firstMonthData, setFirstMonthData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [filterLevel, setFilterLevel] = useState("");
  const [sortName, setSortName] = useState(""); // "asc" or "desc"
  const [sortId, setSortId] = useState(""); // "asc" or "desc"
  const [filterM1, setFilterM1] = useState("");
  const [filterM2, setFilterM2] = useState("");
  const [filterTotal, setFilterTotal] = useState("");

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: userResult, error: userError } = await supabase
        .from('user_data')
        .select('*');
      if (userError) throw userError;

      const { data: firstMonthResult, error: firstMonthError } = await supabase
        .from('first_month')
        .select('*');
      if (firstMonthError) throw firstMonthError;

      const { data: historyResult, error: historyError } = await supabase
        .from('history_data')
        .select('*');
      if (historyError) throw historyError;

      setUserData(userResult);
      setFirstMonthData(firstMonthResult);
      setHistoryData(historyResult);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handlePasscodeSubmit = () => {
    const correctPasscode = "1234";
    if (passcode === correctPasscode) {
      setIsAuthorized(true);
    } else {
      alert("Incorrect passcode! Please try again.");
    }
  };

  const handleUpgrade = async (id) => {
    try {
      const firstMonth = firstMonthData.find(item => item.id === id);
      const user = userData.find(item => item.id === id);
      const historyRecord = historyData.find(item => item.id === id);

      const M1 = Number(firstMonth?.ppcg || 0);
      const M2 = Number(user?.ppcg || 0);
      const totalPcg = M1 + M2;
      const currentHistoryPpcg = Number(historyRecord?.ppcg || 0);
      const finalPpcg = currentHistoryPpcg + totalPcg;

      const { error: historyError } = await supabase
        .from('history_data')
        .upsert([{ 
          id, 
          ppcg: finalPpcg,
          perso: user.perso,
          parainage_points: user.parainage_points,
          parainage_users: user.parainage_users
        }]);
      if (historyError) throw historyError;

      const { error: firstMonthError } = await supabase
        .from('first_month')
        .upsert([{ id, ppcg: 0 }]);
      if (firstMonthError) throw firstMonthError;

      const { error: userError } = await supabase
        .from('user_data')
        .upsert([{ 
          id, 
          ppcg: 0,
          perso: user.perso,
          parainage_points: user.parainage_points,
          parainage_users: user.parainage_users
        }]);
      if (userError) throw userError;

      setSuccessMessage("Upgrade completed successfully!");
      fetchAllData();
    } catch (error) {
      console.error("Error during upgrade:", error);
      setSuccessMessage("Error during upgrade operation");
    }
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDowngrade = async (id) => {
    try {
      const firstMonth = firstMonthData.find(item => item.id === id);
      const user = userData.find(item => item.id === id);

      const M2 = user?.ppcg || 0;

      const { error: firstMonthError } = await supabase
        .from('first_month')
        .upsert([{ id, ppcg: M2 }]);
      if (firstMonthError) throw firstMonthError;

      const { error: userError } = await supabase
        .from('user_data')
        .upsert([{ 
          id, 
          ppcg: 0,
          perso: user.perso,
          parainage_points: user.parainage_points,
          parainage_users: user.parainage_users
        }]);
      if (userError) throw userError;

      setSuccessMessage("Downgrade completed successfully!");
      fetchAllData();
    } catch (error) {
      console.error("Error during downgrade:", error);
      setSuccessMessage("Error during downgrade operation");
    }
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getFilteredUsers = () => {
    let filtered = historyData.map((history) => {
      const firstMonth = firstMonthData.find((item) => item.id === history.id) || { ppcg: 0 };
      const user = userData.find((item) => item.id === history.id) || { ppcg: 0, name: "Unknown" };
      return {
        id: history.id,
        name: user.name,
        level: determineLevel(Number(history.ppcg || 0)), // Explicitly using history.ppcg
        firstMonthPpcg: Number(firstMonth.ppcg || 0),
        userPpcg: Number(user.ppcg || 0),
        totalPcg: Number(firstMonth.ppcg || 0) + Number(user.ppcg || 0)
      };
    });

    // Filter by Level
    if (filterLevel) {
      filtered = filtered.filter(user => 
        user.level.toLowerCase().includes(filterLevel.toLowerCase())
      );
    }

    // Filter by M1
    if (filterM1) {
      filtered = filtered.filter(user => user.firstMonthPpcg >= Number(filterM1));
    }

    // Filter by M2
    if (filterM2) {
      filtered = filtered.filter(user => user.userPpcg >= Number(filterM2));
    }

    // Filter by Total PCG
    if (filterTotal) {
      filtered = filtered.filter(user => user.totalPcg >= Number(filterTotal));
    }

    // Sort by Name
    if (sortName) {
      filtered.sort((a, b) => 
        sortName === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name)
      );
    }

    // Sort by ID
    if (sortId) {
      filtered.sort((a, b) => 
        sortId === "asc" ? a.id - b.id : b.id - a.id
      );
    }

    return filtered;
  };

  const levelOptions = [
    "Distributeur", "Animateur", "Animateur Junior", "Animateur Senior",
    "Manager", "Manager Junior", "Manager Senior"
  ];

  const numericOptions = [50, 100, 6250, 12500, 18700, 30000, 50000];

  return (
    <div>
      {!isAuthorized ? (
        <div>
          <h2>Enter Passcode</h2>
          <input
            type="password"
            className="parrain-input"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
          />
          <button onClick={handlePasscodeSubmit}>Submit</button>
        </div>
      ) : (
        <>
          <h1 style={{ color: "black" }}>Monthly Up</h1>
          
          {/* Filter Buttons */}
          <div style={{ marginBottom: "20px" }}>
            {/* Level Filter */}
            <div style={{ marginBottom: "10px" }}>
              <label>Level: </label>
              <select 
                value={filterLevel} 
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                {levelOptions.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Name Sort */}
            <div style={{ marginBottom: "10px" }}>
              <label>Name: </label>
              <button onClick={() => setSortName("asc")}>A-Z</button>
              <button onClick={() => setSortName("desc")}>Z-A</button>
              <button onClick={() => setSortName("")}>Reset</button>
            </div>

            {/* ID Sort */}
            <div style={{ marginBottom: "10px" }}>
              <label>ID: </label>
              <button onClick={() => setSortId("asc")}>Low-High</button>
              <button onClick={() => setSortId("desc")}>High-Low</button>
              <button onClick={() => setSortId("")}>Reset</button>
            </div>

            {/* M1 Filter */}
            <div style={{ marginBottom: "10px" }}>
              <label>M1: </label>
              <select 
                value={filterM1} 
                onChange={(e) => setFilterM1(e.target.value)}
              >
                <option value="">All</option>
                {numericOptions.map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            {/* M2 Filter */}
            <div style={{ marginBottom: "10px" }}>
              <label>M2: </label>
              <select 
                value={filterM2} 
                onChange={(e) => setFilterM2(e.target.value)}
              >
                <option value="">All</option>
                {numericOptions.map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            {/* Total PCG Filter */}
            <div style={{ marginBottom: "10px" }}>
              <label>Total PCG: </label>
              <select 
                value={filterTotal} 
                onChange={(e) => setFilterTotal(e.target.value)}
              >
                <option value="">All</option>
                {numericOptions.map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Level</th>
                    <th>M1</th>
                    <th>M2</th>
                    <th>Total PCG</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredUsers().map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.level}</td>
                      <td>{user.firstMonthPpcg}</td>
                      <td>{user.userPpcg}</td>
                      <td>{user.totalPcg}</td>
                      <td>
                        <button onClick={() => handleUpgrade(user.id)}>Upgrade</button>
                        <button onClick={() => handleDowngrade(user.id)}>Downgrade</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlyUp;