import React, { useState, useEffect } from "react";
import "./Historique.css";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";

const Historique = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("Please log in before making a purchase.");
        return;
      }

      const { data, error } = await supabase
        .from("order")
        .select("id, product_ref, total_price, created_at, order_status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const getStatus = (status) => {
    switch (status) {
      case "validé":
        return { emoji: "🟢", color: "#00CD07" };
      case "en attente":
        return { emoji: "🟠", color: "#F98900" };
      case "refusé":
        return { emoji: "🔴", color: "#E91E32" };
      default:
        return { emoji: "⚪", color: "gray" };
    }
  };

  return (
    <div>
      <Header />
      <div className="historique-container">
        <header className="historique-header">
          <h2>Historique des Commandes</h2>
        </header>
        <div className="historique-content">
          {loading ? (
            <p className="loading">Chargement...</p>
          ) : orders.length === 0 ? (
            <p className="no-history">Aucune commande enregistrée pour le moment.</p>
          ) : (
            orders.map((order) => {
              const { emoji, color } = getStatus(order.order_status);
              return (
                <div key={order.id} className="history-card">
                  <div className="history-details">
                    <p className="history-title">Commande ID: {order.id}</p>
                    <p className="history-product">Réf: {order.product_ref}</p>
                    <p className="history-price">Prix total: {order.total_price} FC</p>
                    <p className="history-status" style={{ color }}>
                      {emoji} {order.order_status}
                    </p>
                    <p className="history-time">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Historique;
