import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Loader from '../components/Loader';
import { ShoppingBag, Calendar, DollarSign, Ban } from "lucide-react";
import './Historique.css';

const OrderCard = ({ order, onCancel }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "validated": return "status-badge status-validated";
      case "pending": return "status-badge status-pending";
      case "refused": return "status-badge status-refused";
      case "canceled": return "status-badge status-canceled";
      default: return "status-badge";
    }
  };

  const getStatusLabel = (status) => {
    switch (status.toLowerCase()) {
      case "validated": return "Validée";
      case "pending": return "En attente";
      case "refused": return "Refusée";
      case "canceled": return "Annulée";
      default: return "Statut inconnu";
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price * 100) + ' DA';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-title">
          <ShoppingBag className="order-icon" />
          <span>Commande #{order.id}</span>
        </div>
        <span className={getStatusClass(order.order_status)}>
          {getStatusLabel(order.order_status)}
        </span>
      </div>
      
      {order.product_image && (
        <div className="order-image-container">
          <img 
            src={order.product_image} 
            alt={`Produit ${order.id}`}
            className="order-image"
          />
        </div>
      )}

      <div className="order-details">
        <div className="detail-item">
          <Calendar className="detail-icon" />
          <span>{formatDate(order.created_at)}</span>
        </div>
        
        <div className="detail-item">
          <DollarSign className="detail-icon" />
          <div className="price-details">
            <div>Prix Total: <span className="price">{formatPrice(order.total_price)}</span></div>
            <div>Commission: <span className="commission">{formatPrice(order.commission)}</span></div>
          </div>
        </div>
      </div>

      {order.order_status !== "canceled" && 
       order.order_status !== "validated" && 
       order.order_status !== "refused" && (
        <button 
          className="cancel-order-btn"
          onClick={() => onCancel(order.id)}
        >
          <Ban className="cancel-icon" />
          Annuler la commande
        </button>
      )}
    </div>
  );
};

const Historique = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setMessage("Veuillez vous connecter pour voir votre historique de commandes.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("order")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        setMessage("Erreur lors du chargement des commandes.");
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

    try {
      const { error } = await supabase
        .from("order")
        .update({ order_status: "canceled" })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId 
            ? { ...order, order_status: "canceled" } 
            : order
        )
      );
      
      setMessage("Commande annulée avec succès.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error cancelling order:", error);
      setMessage("Erreur lors de l'annulation de la commande.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="historique-page">
      <Header />
      <div className="historique-container">
        <div className="historique-card">
          <div className="historique-header">
            <h2 className="historique-title">Historique des Commandes</h2>
          </div>
          <div className="historique-content">
            {message && (
              <div className="message">
                {message}
              </div>
            )}
            
            {orders.length === 0 ? (
              <div className="empty-state">
                Aucune commande enregistrée pour le moment.
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onCancel={handleCancelOrder}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historique;