import React from "react";

const UserLevelDisplay = ({ level }) => {
  return (
    <h2 style={{ color: "#9A9A9A", fontWeight: "medium" }}>
      {level || "Loading..."}
    </h2>
  );
};

export default UserLevelDisplay;
