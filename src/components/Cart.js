import React, { useState } from "react";
import { FaTrash, FaTimes, FaCopy } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useUser } from "./UserContext";
import "./Cart.css";

const Cart = ({ cartItems, onRemoveItem, onClose }) => {
  const { level, calculateLevel } = useUser();
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Define discount percentages for each level
  const discountPercentages = {
    "Distributeur": 0.20,
    "Animateur Adjoint": 0.35, // 35%
    "Animateur": 0.38,         // 38%
    "Manager Adjoint": 0.43,   // 40%
    "Manager": 0.48,           // 48%
  };

  // Get the discount multiplier based on the level
  const discountMultiplier = discountPercentages[level] || 0; // Default to 0 (no discount) if level is not found

  // Calculate discounted prices for each item
  const discountedItems = cartItems.map((item) => ({
    ...item,
    discountedPrice: item.price * (1 - discountMultiplier),
  }));

  // Calculate total FC (with discounts applied)
  const totalFC = discountedItems.reduce((total, item) => total + item.discountedPrice, 0);

  // Calculate total DZD (using the discounted total in FC)
  const totalDZD = totalFC * 100;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setReceiptFile(file);
  };

  const handleBuyNow = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please log in before making a purchase.");
      return;
    }

    if (selectedImage === "poste" && !receiptFile) {
      alert("Please upload a receipt before proceeding.");
      return;
    }

    try {
      const fileName = receiptFile && `${user.id}-${Date.now()}-${receiptFile.name}`;
      let publicUrl = null;

      if (receiptFile) {
        const { data: storageData, error: storageError } = await supabase.storage
          .from("receipt")
          .upload(fileName, receiptFile);

        if (storageError || !storageData?.path) {
          alert("Failed to upload the receipt. Please try again.");
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("receipt")
          .getPublicUrl(storageData.path);

        publicUrl = publicUrlData?.publicUrl;
      }

      const orderData = {
        user_id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        product_ref: cartItems.map((item) => item.ref).join(", "),
        total_price: totalFC.toFixed(2),
        receipt: publicUrl || "By BaridiMob",
        order_status: "en attente", 
      };

      const { error: orderError } = await supabase.from("order").insert(orderData);

      if (orderError) {
        alert("Failed to place the order. Please try again.");
      } else {
        alert("Order placed successfully!");
        onRemoveItem();  
        onClose();  
      }
    } catch {
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleClick = (imageName) => {
    setSelectedImage(imageName);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Échec de la copie du texte :", err);
    });
  };

  return (
    <div className="cart-dropdown">
      <h3>Your Cart</h3>
      <button className="close-button" onClick={onClose}>
        <FaTimes size={24} />
      </button>
      
      <h2 style={{ color: "#9A9A9A", fontWeight: "medium" }}>{level || "Loading..."}</h2>
      <h1 style={{ color: "#007bff", fontWeight: "bold" }}>Discount: {discountMultiplier * 100}%</h1>

      <ul>
        {discountedItems.map((item, index) => (
          <li key={index} className="cart-item">
            <img src={item.product_image} alt={item.title} />
            <div>
              <h4>Ref: {item.ref}</h4>
              <p style={{ color: "#007bff", fontWeight: "bold" }}>
                {item.discountedPrice.toFixed(2)} FC
              </p>
              <p>{(item.discountedPrice * 100).toLocaleString()} DZD</p>
            </div>
            <button className="remove-item-button" onClick={() => onRemoveItem(index)}>
              <FaTrash style={{ marginTop: "5px" }} />
            </button>
          </li>
        ))}
      </ul>
      
      <div className="cart-summary">
        <p>Total FC: {totalFC.toFixed(2)} FC</p>
        <p>Total DZD: {totalDZD.toLocaleString()} DZD</p>
        <br />
        <br />
      </div>
      
      <ul>
        <div className="container">
        <div className="image-container">
            <img
              className="imageP"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/AlgeriePoste.svg/1200px-AlgeriePoste.svg.png"
              alt="poste"
              onClick={() => handleClick("poste")}
              tabIndex="0"
            />
            <img
              className="imageP"
              src="https://seeklogo.com/images/B/baridimob-logo-2E48D2A2FB-seeklogo.com.png"
              alt="baridi"
              onClick={() => handleClick("baridimob")}
              tabIndex="0"
            />
          </div>

          {selectedImage && (
            <div className="details">
              <h3 style={{ color: "black" }}>Pour {selectedImage}</h3>
              <br />
              {selectedImage === "poste" && (
                <div>
                  <p><span className="label">Nom:</span> <span>Imad Boulaa</span></p>
                  <p><span className="label">Numéro de CCP:</span> <span>0022040544 <FaCopy className="copy-icon" onClick={(e) => { e.stopPropagation(); handleCopy("0022040544"); }} /></span></p>
                  <p><span className="label">Le clé:</span> <span>79 <FaCopy className="copy-icon" onClick={(e) => { e.stopPropagation(); handleCopy("79"); }} /></span></p>
                  <br />
                  <p style={{ color: "black" }}>Envoyer la photo du reçu:</p>
                  <input
                    type="file"
                    className="paiment-input"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              )}
              {selectedImage === "baridimob" && (
                <div>
                  <p><span className="label">Rip:</span> <span>002494729723 <FaCopy className="copy-icon" onClick={(e) => { e.stopPropagation(); handleCopy("0022040544"); }} /></span></p>
                  <br />
                  <p style={{ color: "black" }}>Envoyer le reçu à cette adresse e-mail:</p>
                  <p><span style={{ color: "black" }} className="label">E-mail:</span> <span>khademni@outlook.com <FaCopy className="copy-icon" onClick={(e) => { e.stopPropagation(); handleCopy("khademni@outlook.com"); }} /></span></p>
                </div>
              )}
            </div>
          )}
        </div>
      </ul>
      
      <br />
      <button className="buy-now-button" onClick={handleBuyNow}>
        Buy Now
      </button>
    </div>
  );
};

export default Cart;
