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
        .select(
          "id, name, phone, total_price, created_at, order_status, product_image"
        )
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

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Êtes-vous sûr de vouloir annuler cette commande ?"
    );
    if (!confirmCancel) return;

    const { error } = await supabase
      .from("order")
      .update({ order_status: "annulé" })
      .eq("id", orderId);

    if (error) {
      console.error("Error cancelling order:", error);
      alert("Erreur lors de l'annulation de la commande.");
    } else {
      alert("Commande annulée avec succès.");
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, order_status: "annulé" } : order
        )
      );
    }
  };

  const getStatus = (status) => {
    switch (status) {
      case "validé":
        return { emoji: "🟢", color: "#00CD07" };
      case "en attente":
        return { emoji: "🟠", color: "#F98900" };
      case "refusé":
        return { emoji: "🔴", color: "#E91E32" };
      case "annulé":
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
            <p className="no-history">
              Aucune commande enregistrée pour le moment.
            </p>
          ) : (
            orders.map((order) => {
              const { emoji, color } = getStatus(order.order_status);
              return (
                <div key={order.id} className="history-card">
                  {order.product_image && (
                    <img
                      src={order.product_image}
                      alt={`Produit ${order.id}`}
                      className="product-image"
                    />
                  )}
                  <div className="history-details">
                    <p style={{ color: "#000" }}>Commande ID: {order.id}</p>
                    <p style={{ color: "#000" }}>
                      Prix total: {order.total_price} FC
                    </p>
                    <p className="history-status" style={{ color }}>
                      {emoji} {order.order_status}
                    </p>
                    <p className="history-time">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    {order.order_status !== "annulé" && order.order_status !== "validé" && order.order_status !== "refusé" && (
                      <button
                        className="cancel-button"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Annuler
                      </button>
                    )}
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
