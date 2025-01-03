import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { FaPhoneAlt } from "react-icons/fa";
import { Email } from "@mui/icons-material";
import { supabase } from "../supabaseClient";
import "./MonEquipe.css";

const MonEquipe = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);

      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser) {
        alert("Please log in.");
        setLoading(false);
        return;
      }

      const currentUserId = String(currentUser.id);

      const { data, error } = await supabase
        .from("user_data")
        .select("*")
        .like("parrain_id", `%${currentUserId}%`);

      if (error) {
        console.error("Error fetching team members:", error);
        setLoading(false);
        return;
      }

      const filteredData = data.filter((member) => {
        if (!member.parrain_id) return false;
        const parrainIds = member.parrain_id.split(",").map((id) => id.trim());
        return parrainIds.includes(currentUserId);
      });

      setTeamMembers(filteredData);
      setLoading(false);
    };

    fetchTeamMembers();
  }, []);

  return (
    <div>
      <Header />
        <>
        <div className="team-container">
          <h2>Mon Équipe <span style={{ color: "#5700B4" }}>{teamMembers.length}</span></h2>
          {loading ? (
            <p>Chargement...</p>
          ) : teamMembers.length === 0 ? (
            <p>Aucun membre trouvé.</p>
          ) : (
            <div className="card-container">
              {teamMembers.map((member) => (
                <div key={member.id} className="team-card">
                  <div className="card-image2">
                  <img
                    src={member.user_image || "/default-profile.png"}
                    alt=""
                    className="team-card-image"
                  />
                  </div>
                  <h3 style={{ color: "#000" }}>{member.name}</h3>
                  <div className="column10">
                  <p style={{ color: "#000" }}>
                    <strong style={{ color: "#5700B4" }}>ID:</strong> {member.identifier}
                  </p>
                  <p style={{ color: "#000" }}>
                    <strong style={{ color: "#5700B4" }}>Sales Points:</strong> {member.perso}
                  </p>
                  <p style={{ color: "#000" }}>
                    <strong style={{ color: "#5700B4" }}>Group Points:</strong> {member.ppcg}
                  </p>
                  <p style={{ color: "#000" }}>
                    <strong style={{ color: "#5700B4" }}><Email /> :</strong>{" "}
                    <a href={`mailto:${member.email}`} className="icon-link">
                      {member.email} <span className="email-icon"></span>
                    </a>
                  </p>
                  <p style={{ color: "#000" }}>
                    <strong style={{ color: "#5700B4" }}><FaPhoneAlt /> :</strong>{" "}
                    <a href={`tel:${member.phone}`} className="icon-link">
                      {member.phone} <span className="phone-icon"></span>
                    </a>
                  </p>
                  </div>
                </div>
              ))}
            </div>
          )} 
        </div>
        </>
    </div>
  );
};

export default MonEquipe;
