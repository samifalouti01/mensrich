import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";
import "./MonEquipe.css";

const MonEquipe = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // For selected user details
  const [showModal, setShowModal] = useState(false); // To toggle modal visibility

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);

      // Example: Replace this with how you get the current user's ID
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser) {
        alert("Please log in.");
        setLoading(false);
        return;
      }

      const currentUserId = String(currentUser.id); // Ensure the ID is a string

      // Fetch rows with rough match
      const { data, error } = await supabase
        .from("user_data")
        .select("*")
        .like("parrain_id", `%${currentUserId}%`);

      if (error) {
        console.error("Error fetching team members:", error);
        setLoading(false);
        return;
      }

      // Filter rows locally for exact matches
      const filteredData = data.filter((member) => {
        if (!member.parrain_id) return false; // Skip if parrain_id is null
        const parrainIds = member.parrain_id.split(",").map((id) => id.trim()); // Split and trim
        return parrainIds.includes(currentUserId); // Check for exact match
      });

      setTeamMembers(filteredData);
      setLoading(false);
    };

    fetchTeamMembers();
  }, []);

  // Function to open the modal and set the selected user
  const openModal = (member) => {
    setSelectedUser(member);
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <div>
      <Header />
      <div className="team-container">
        <h2>Mon Équipe</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : teamMembers.length === 0 ? (
          <p>Aucun membre trouvé.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Identifiant</th>
                <th>Numero de telephone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.id}</td>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.identifier}</td>
                  <td>{member.phone}</td>
                  <td>
                    <button onClick={() => openModal(member)}>Voir Détails</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal to show user details */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Détails de {selectedUser.name}</h2>
            <p><strong>ID:</strong> {selectedUser.id}</p>
            <p><strong>Nom:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Identifiant:</strong> {selectedUser.identifier}</p>
            <p><strong>Numéro de téléphone:</strong> {selectedUser.phone}</p>
            <p><strong>Date de naissance:</strong> {selectedUser.birthdate}</p>
            <p><strong>Perso:</strong> {selectedUser.perso}</p>
            <p><strong>Parrainage Points:</strong> {selectedUser.parainage_points}</p>
            <p><strong>Parrainage Users:</strong> {selectedUser.parainage_users}</p>
            <p><strong>PCG:</strong> {selectedUser.ppcg}</p>
            <button onClick={closeModal}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonEquipe;
