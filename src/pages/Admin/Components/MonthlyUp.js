import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const MonthlyUp = () => {
  const [userData, setUserData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_data')
      .select('id, perso, parainage_points, parainage_users, ppcg');
                
    setLoading(false);
    if (error) {
      console.error("Error fetching user data:", error);
    } else {
      setUserData(data);
    }
  };

  const fetchHistoryData = async () => {
    const { data, error } = await supabase
      .from('history_data')
      .select('id, perso, parainage_points, parainage_users, ppcg');
    
    if (error) {
      console.error("Error fetching history data:", error);
    } else {
      setHistoryData(data);
    }
  };

  const handlePasscodeSubmit = () => {
    const correctPasscode = "06Sami06";
    if (passcode === correctPasscode) {
      setIsAuthorized(true);
    } else {
      alert("Incorrect passcode! Please try again.");
    }
  };

  const handleUpdateAll = async () => {
    let success = true;
    for (let i = 0; i < userData.length; i++) {
      const user = userData[i];
      const history = historyData.find((data) => data.id === user.id);
  
      if (user && history) {
        const updatedPerso = (+user.perso || 0) + (+history.perso || 0);
        const updatedParainagePoints = (+user.parainage_points || 0) + (+history.parainage_points || 0);
        const updatedParainageUsers = (+user.parainage_users || 0) + (+history.parainage_users || 0);
        const updatedPpcg = (+user.ppcg || 0) + (+history.ppcg || 0);
        
        const { error } = await supabase
          .from('history_data')
          .upsert([
            {
              id: user.id,
              perso: updatedPerso,
              parainage_points: updatedParainagePoints,
              parainage_users: updatedParainageUsers,
              ppcg: updatedPpcg,
            },
          ]);
  
        if (error) {
          console.error(`Error updating row for id ${user.id}:`, error);
          success = false;
        }
      }
    }
  
    if (success) {
      setSuccessMessage("All data updated successfully!");
    } else {
      setSuccessMessage("Some rows failed to update.");
    }
  
    setTimeout(() => setSuccessMessage(""), 3000);
  
    fetchHistoryData();
  };
  

  const handleDeleteAll = async () => {
    let success = true;
    for (let i = 0; i < userData.length; i++) {
      const user = userData[i];
      
      const { error } = await supabase
        .from('user_data')
        .upsert([
          {
            id: user.id,
            perso: 0,
            parainage_points: 0,
            parainage_users: 0,
            ppcg: 0,
          },
        ]);

      if (error) {
        console.error(`Error resetting row for id ${user.id}:`, error);
        success = false;
      }
    }

    if (success) {
      setSuccessMessage("All user data reset to 0!");
    } else {
      setSuccessMessage("Some rows failed to reset.");
    }

    setTimeout(() => setSuccessMessage(""), 3000);
    fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
    fetchHistoryData();
  }, []);

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
          <button onClick={handleUpdateAll}>Update All</button>

          <button style={{ backgroundColor: "red", color: "white", marginLeft: "10px" }} onClick={handleDeleteAll}>Delete All</button>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}  {/* Display success message */}
              <table>
                <thead>
                  <tr>
                    <th>id</th>
                    <th>perso</th>
                    <th>parainage_points</th>
                    <th>parainage_users</th>
                    <th>ppcg</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.perso}</td>
                      <td>{product.parainage_points}</td>
                      <td>{product.parainage_users}</td>
                      <td>{product.ppcg}</td>
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