export const determineLevel = (points) => {
  if (isNaN(points)) return "Distributeur";
  if (points >= 50000) return "Manager Senior";
  if (points >= 30000) return "Manager Junior";
  if (points >= 18700) return "Manager";
  if (points >= 12500) return "Animateur Senior";
  if (points >= 6250) return "Animateur Junior";
  if (points >= 100) return "Animateur";
  return "Distributeur";
};

export const getCommission = (userLevel, referralLevel) => {
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

export const calculateUserStatus = (perso, level) => {
  const thresholds = {
    "Manager Senior": 500,
    "Manager Junior": 400,
    Manager: 300,
    "Animateur Senior": 200,
    "Animateur Junior": 100,
  };
  return perso >= (thresholds[level] || 0) ? "Actif" : "Inactif";
};

export const getThresholdForLevel = (level) => {
  const thresholds = {
    "Manager Senior": 500,
    "Manager Junior": 400,
    Manager: 300,
    "Animateur Senior": 200,
    "Animateur Junior": 100,
  };
  return thresholds[level] || 0; // Default to 0 for Distributeur or Animateur
};

export const getMaxCommissionForLevel = (level) => {
  const maxCommissions = {
    "Manager Senior": 10,    // Highest is 10% from Animateur
    "Manager Junior": 8,     // Highest is 8% from Animateur
    Manager: 6,              // Highest is 6% from Animateur
    "Animateur Senior": 4,   // Highest is 4% from Animateur
    "Animateur Junior": 2,   // Highest is 2% from Animateur
    Animateur: 0,            // No commission from lower levels
    Distributeur: 0,         // No commission
  };
  return maxCommissions[level] || 0;
};