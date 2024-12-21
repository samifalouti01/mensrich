import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { supabase } from "../supabaseClient";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [level, setLevel] = useState("Distributeur");
  const [totalPoints, setTotalPoints] = useState(0);
  const [nextLevel, setNextLevel] = useState("");
  const [levelProgress, setLevelProgress] = useState(0);
  const [pointsToNextLevel, setPointsToNextLevel] = useState(0);

  const calculateLevel = (points) => {
    let currentLevel = "Distributeur";
    let nextLevel = "Animateur Adjoint";
    let progress = 0;
    let pointsNeeded = 0;

    if (points >= 100 && points < 6250) {
      currentLevel = "Animateur Adjoint";
      nextLevel = "Animateur";
      progress = ((points - 100) / (6250 - 100)) * 100;
      pointsNeeded = 6250 - points;
    } else if (points >= 6250 && points < 18700) {
      currentLevel = "Animateur";
      nextLevel = "Manager Adjoint";
      progress = ((points - 6250) / (18700 - 6250)) * 100;
      pointsNeeded = 18700 - points;
    } else if (points >= 18700 && points < 30000) {
      currentLevel = "Manager Adjoint";
      nextLevel = "Manager";
      progress = ((points - 18700) / (30000 - 18700)) * 100;
      pointsNeeded = 30000 - points;
    } else if (points >= 30000) {
      currentLevel = "Manager";
      nextLevel = "Maximum Level Achieved";
      progress = 100;
      pointsNeeded = 0;
    } else {
      progress = (points / 100) * 100;
      pointsNeeded = 100 - points;
    }

    setLevel(currentLevel);
    setNextLevel(nextLevel);
    setLevelProgress(progress);
    setPointsToNextLevel(pointsNeeded);
  };

  const fetchUserData = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("history_data")
      .select("ppcg")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }

    const total = Number(data.ppcg || 0);
    setTotalPoints(total);
    calculateLevel(total);
  }, [calculateLevel]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      fetchUserData(user.id);
    }
  }, [fetchUserData]);

  return (
    <UserContext.Provider
      value={{
        level,
        totalPoints,
        nextLevel,
        levelProgress,
        pointsToNextLevel,
        calculateLevel,  // Include calculateLevel here
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
