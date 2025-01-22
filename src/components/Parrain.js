import React, { useState, useEffect } from "react";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Parrain.css";

const Parrain = React.forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    parrain_id: "",
    validate: "unvalidate",
    name: "",
    identifier: "",
    password: "",
    phone: "",
    email: "",
    birthdate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, parrain_id: user.id }));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "identifier") { setFormData({ ...formData, [name]: value.startsWith("MR") ? value : `MR${value}`, }); } else { setFormData({ ...formData, [name]: value, }); } };

  const handleCopy = () => {
    const textToCopy = `ID: ${formData.identifier}\nPassword: ${formData.password}`;
    navigator.clipboard.writeText(textToCopy);
    alert("Credentials copied to clipboard!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const { data: existingIdentifier, error: identifierError } = await supabase
        .from("user_data")
        .select("id")
        .eq("identifier", formData.identifier)
        .single();

      if (identifierError && identifierError.code !== "PGRST116") {
        throw new Error("An error occurred while checking the identifier.");
      }

      if (existingIdentifier) {
        setError("Erreur : Cet identifiant est déjà pris.");
        setLoading(false);
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem("user"));
  
      const { data: currentUserData, error: userDataError } = await supabase
        .from("user_data")
        .select("parrain_id")
        .eq("id", currentUser.id)
        .single();
  
      if (userDataError) throw new Error("Failed to fetch current user data.");

      const { error: updateValidateError } = await supabase
        .from("user_data")
        .update({ validate: "unvalidate" })
        .eq("id", currentUser.id);

      if (updateValidateError) throw new Error("Failed to update validation status.");
  
      const parrainId = currentUserData.parrain_id;
      const combinedParrainId = `${currentUser.id},${parrainId || ""}`; // Combine current user ID with parrain_id
  
      const updatedFormData = {
        ...formData,
        perso: 0,
        parainage_points: 0,
        parainage_users: 0, 
        ppcg: 0,
        parrain_id: combinedParrainId, 
      };
  
      const { error } = await supabase.from("user_data").insert([updatedFormData]);
      if (error) throw error;
  
      const { data: userData, error: userError } = await supabase
        .from("user_data")
        .select("parainage_users")
        .eq("id", currentUser.id)
        .single();
  
      if (userError) throw new Error("Failed to fetch current user data.");
  
      const currentParainageUsers = parseInt(userData.parainage_users || "0", 10);
      const updatedParainageUsers = currentParainageUsers + 1;
  
      const { error: updateError } = await supabase
        .from("user_data")
        .update({ parainage_users: updatedParainageUsers })
        .eq("id", currentUser.id);
  
      if (updateError) throw new Error("Failed to update parainage_users.");

      // After successful user creation, get the new user's ID
      const { data: newUser } = await supabase
      .from("user_data")
      .select("id")
      .eq("identifier", formData.identifier)
      .single();

      // Create history_data record
      const { error: historyError } = await supabase
      .from("history_data")
      .insert([{
        id: newUser.id,
        perso: 0,
        parainage_points: 0,
        parainage_users: 0,
        ppcg: 0
      }]);

      if (historyError) throw new Error("Failed to create history record");

      // Create first_month record
      const { error: firstMonthError } = await supabase
      .from("first_month")
      .insert([{
        id: newUser.id,
        ppcg: 0,
        perso: 0
      }]);

      if (firstMonthError) throw new Error("Failed to create first month record");
  
      setSuccess("Parrainage réussi !");
      setShowPopup(true); 
    } catch (err) {
      setError(`Erreur : ${err.message || "Une erreur inconnue s'est produite."}`);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => { setIsPasswordVisible(!isPasswordVisible); };

  return (
    <div className="parrain" ref={ref}>
      <div className="parrain-header">
        <h2 className="parrain-title">Register</h2>
        <button className="close-button" onClick={props.onClose}>
          <FaTimes size={24} />
        </button>
      </div>
      <form className="parrain-form" onSubmit={handleSubmit}>
        <input
          type="hidden"
          name="parrain_id"
          value={formData.parrain_id}
          onChange={handleChange}
        />
          <input
            type="text"
            placeholder="Nom et Prénom"
            name="name"
            className="parrain-input"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="ID Numérique"
            name="identifier"
            className="parrain-input"
            value={formData.identifier}
            onChange={handleChange}
            required
          />
          <div className="password-input-container">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Mot de Passe"
              name="password"
              className="parrain-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="toggle-password" onClick={togglePasswordVisibility}>
              {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <input
            type="text"
            placeholder="Téléphone"
            name="phone"
            className="parrain-input"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            className="parrain-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          Birthdate:
          <input
            type="date"
            name="birthdate"
            placeholder="Date de Naissance"
            className="parrain-input"
            value={formData.birthdate}
            onChange={handleChange}
            required
          />
        <button className="parrain-button" type="submit" disabled={loading}>
          {loading ? "En cours..." : "Parrainer"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 style={{ color: "#000" }}>Credentials</h3>
            <p style={{ color: "#000" }}>ID: {formData.identifier}</p>
            <p style={{ color: "#000" }}>Password: {formData.password}</p>
            <button onClick={handleCopy}>Copy</button>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default Parrain;
