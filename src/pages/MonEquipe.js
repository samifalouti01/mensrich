import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { FaPhoneAlt } from "react-icons/fa";
import { Email } from "@mui/icons-material";
import { supabase } from "../supabaseClient";
import Loader from '../components/Loader';
import "./MonEquipe.css";

const MonEquipe = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      setIsLoading(true);

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
    
      setIsLoading(false);
    };

    fetchTeamMembers();
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
        <>
        <div className="team-container">
          <h2>فريقي <span style={{ color: "#5700B4" }}>{teamMembers.length}</span></h2>
          {loading ? (
            <p>جاري التحميل...</p>
          ) : teamMembers.length === 0 ? (
            <p>لم يتم العثور على أي أعضاء.</p>
          ) : (
            <div className="card-container">
              {teamMembers.map((member) => (
                <div key={member.id} className="equipe-card">
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
                    <strong style={{ color: "#5700B4" }}>اسم المستخدم:</strong> {member.identifier}
                  </p>
                  <p style={{ color: "#000" }}>
                    <strong style={{ color: "#5700B4" }}>نقاط البيع:</strong> {member.perso}
                  </p>
                  <p style={{ color: "#000" }}>
                    <strong style={{ color: "#5700B4" }}>النقاط الجماعية:</strong> {member.ppcg}
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
