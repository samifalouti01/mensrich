import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./OrderForm.css";

const OrderForm = ({ product }) => {
  const [wilayas, setWilayas] = useState([
    { id: "16", name: "Algiers", deliveryPrice: 3 },
    { id: "01", name: "Adrar", deliveryPrice: 5 },
    { id: "02", name: "Chlef", deliveryPrice: 4 },
  ]);

  const [communes, setCommunes] = useState([]);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState("desktop");
  const [address, setAddress] = useState("");
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(product.price);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const wilaya = wilayas.find((w) => w.id === selectedWilaya);
    if (wilaya) {
      const price = Number(product.price);
      const deliveryCost = Number(wilaya.deliveryPrice);
      setDeliveryPrice(deliveryCost);
      setTotalPrice(price + deliveryCost);
    }

    const fetchUserId = async () => {
      const user = await supabase.auth.getUser();
      setUserId(user.data?.user?.id); // Assuming the user is authenticated
    };

    fetchUserId();
  }, [selectedWilaya, product.price, wilayas]);

  const handleWilayaChange = (e) => {
    const wilayaId = e.target.value;
    setSelectedWilaya(wilayaId);

    const communeData = {
      "16": ["Bab El Oued", "Kouba", "Hydra"],
      "01": ["Commune 1A", "Commune 1B"],
      "02": ["Commune 2A", "Commune 2B"],
    };
    setCommunes(communeData[wilayaId] || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      name: e.target.name.value,
      phone: e.target.phone.value,
      wilaya: selectedWilaya,
      commune: selectedCommune,
      total_price: totalPrice.toString(),
      phone: e.target.phone.value,
      order_status: "Pending",
      order_image_link: product.image_url || "", // Assuming the product object has the image_url field
      user_id: userId, 
      address: deliveryType === "home" ? address : null,
      price: product.price.toString(),
    };

    const { error } = await supabase.from("order").insert([orderData]);
    if (error) {
      alert("Error placing order: " + error.message);
    } else {
      alert("Order placed successfully!");
    }
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input className="input-form" type="text" name="name" required />
      </div>
      <div>
        <label>Phone Number:</label>
        <input className="input-form" type="text" name="phone" required />
      </div>
      <div>
        <label>Wilaya:</label>
        <select onChange={handleWilayaChange} required>
          <option value="">Select Wilaya</option>
          {wilayas.map((wilaya) => (
            <option key={wilaya.id} value={wilaya.id}>
              {wilaya.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Commune:</label>
        <select
          onChange={(e) => setSelectedCommune(e.target.value)}
          value={selectedCommune}
          required
        >
          <option value="">Select Commune</option>
          {communes.map((commune, index) => (
            <option key={index} value={commune}>
              {commune}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Delivery Type:</label>
        <select
          onChange={(e) => setDeliveryType(e.target.value)}
          value={deliveryType}
        >
          <option value="desktop">Desktop</option>
          <option value="home">Home</option>
        </select>
      </div>
      {deliveryType === "home" && (
        <div>
          <label>Address:</label>
          <input
            type="text"
            onChange={(e) => setAddress(e.target.value)}
            value={address}
            required
          />
        </div>
      )}
      <div>
        <p className="p-text">Delivery Price: {(deliveryPrice * 100).toLocaleString()} DA</p>
        <p className="p-text">Total Price: {(totalPrice * 100).toLocaleString()} DA</p>
      </div>
      <button className="btn-form" type="submit">Buy</button>
    </form>
  );
};

export default OrderForm;
