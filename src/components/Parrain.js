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
    card_recto: "",
    card_verso: "",
  });
  const [cardRectoFile, setCardRectoFile] = useState(null);
  const [cardVersoFile, setCardVersoFile] = useState(null);
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
    if (name === "identifier") { setFormData({ ...formData, [name]: value.startsWith("DZ") ? value : `DZ${value}`, }); } else { setFormData({ ...formData, [name]: value, }); } };

  const handleCopy = () => {
    const textToCopy = `ID: ${formData.identifier}\nPassword: ${formData.password}`;
    navigator.clipboard.writeText(textToCopy);
    alert("Credentials copied to clipboard!");
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "recto") setCardRectoFile(file);
    if (type === "verso") setCardVersoFile(file);
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

      let cardRectoUrl = "";
      let cardVersoUrl = "";
  
      if (cardRectoFile) {
        const { data: rectoData, error: rectoError } = await supabase.storage
          .from("cards")
          .upload(`recto/${Date.now()}_${cardRectoFile.name}`, cardRectoFile);
        if (rectoError) {
          console.error(rectoError);
          throw new Error("Failed to upload recto image.");
        }
        cardRectoUrl = supabase.storage.from("cards").getPublicUrl(rectoData.path).data.publicUrl;
      }
  
      if (cardVersoFile) {
        const { data: versoData, error: versoError } = await supabase.storage
          .from("cards")
          .upload(`verso/${Date.now()}_${cardVersoFile.name}`, cardVersoFile);
        if (versoError) throw new Error("Failed to upload verso image.");
        cardVersoUrl = supabase.storage.from("cards").getPublicUrl(versoData.path).data.publicUrl;
      }
  
      // Get the current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user"));
  
      // Retrieve the current user's parrain_id
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
  
      // Get the current user's parrain_id and combine it with the current user's ID
      const parrainId = currentUserData.parrain_id;
      const combinedParrainId = `${currentUser.id},${parrainId || ""}`; // Combine current user ID with parrain_id
  
      const updatedFormData = {
        ...formData,
        card_recto: cardRectoUrl,
        card_verso: cardVersoUrl,
        perso: 0,
        parainage_points: 0,
        parainage_users: 0, // Initialize with 0
        ppcg: 0,
        parrain_id: combinedParrainId, // Set the combined parrain_id
      };
  
      // Insert the new user with the combined parrain_id
      const { error } = await supabase.from("user_data").insert([updatedFormData]);
      if (error) throw error;
  
      // Update the current user's parainage_users field
      const { data: userData, error: userError } = await supabase
        .from("user_data")
        .select("parainage_users")
        .eq("id", currentUser.id)
        .single();
  
      if (userError) throw new Error("Failed to fetch current user data.");
  
      const currentParainageUsers = parseInt(userData.parainage_users || "0", 10);
      const updatedParainageUsers = currentParainageUsers + 1;
  
      // Update the current user's parainage_users value
      const { error: updateError } = await supabase
        .from("user_data")
        .update({ parainage_users: updatedParainageUsers })
        .eq("id", currentUser.id);
  
      if (updateError) throw new Error("Failed to update parainage_users.");
  
      setSuccess("Parrainage réussi !");
      setShowPopup(true); // Show popup on success
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
        <h2 className="parrain-title">Parrainer</h2>
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
          Carte Recto:
          <input
            type="file"
            name="Carte Recto"
            className="parrain-input"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "recto")}
            required
          />
          Carte Verso:
          <input
            type="file"
            name="Carte Verso"
            className="parrain-input"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "verso")}
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
            <h3>Credentials</h3>
            <p>ID: {formData.identifier}</p>
            <p>Password: {formData.password}</p>
            <button onClick={handleCopy}>Copy</button>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default Parrain;
