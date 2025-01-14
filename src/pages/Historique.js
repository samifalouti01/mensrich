import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Badge, Card, Container, Row, Col, Button, Spinner } from 'react-bootstrap';

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
        .select("id, name, phone, total_price, created_at, order_status, product_image, commission")
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
      .update({ order_status: "canceled" })
      .eq("id", orderId);

    if (error) {
      console.error("Error cancelling order:", error);
      alert("Erreur lors de l'annulation de la commande.");
    } else {
      alert("Commande annulée avec succès.");
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, order_status: "canceled" } : order
        )
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "validated": 
        return <Badge bg="success">Validée</Badge>;
      case "pending":
        return <Badge bg="warning" text="dark">En attente</Badge>;
      case "refused":
        return <Badge bg="danger">Refusée</Badge>;
      case "canceled":
        return <Badge bg="danger">Annulée</Badge>;
      default:
        return <Badge bg="secondary">Statut inconnu</Badge>;
    }
  };  

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' DA';
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
    <>
      <Header />
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center mb-4 fw-bold">Historique des Commandes</h2>
          </Col>
        </Row>
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Chargement...</span>
            </Spinner>
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <p className="mb-0 text-muted">Aucune commande enregistrée pour le moment.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {orders.map((order) => (
              <Col key={order.id}>
                <Card className="h-100 shadow-sm">
                  {order.product_image && (
                    <Card.Img 
                      variant="top" 
                      src={order.product_image} 
                      alt={`Produit ${order.id}`}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Card.Title style={{ color: "#5700B4" }} className="mb-0">Commande #{order.id}</Card.Title>
                      {getStatusBadge(order.order_status)}
                    </div>
                    <Card.Text>
                      <small className="text-muted d-block mb-2">
                        {formatDate(order.created_at)}
                      </small>
                      <strong style={{ color: "#5700B4" }} className="d-block mb-3">
                        {formatPrice(order.total_price * 100)}
                      </strong>
                      <p style={{ color: "#5700B4", fontSize: "18px" }} className="d-block mb-3">
                        {formatPrice(order.commission * 100)}
                      </p>
                    </Card.Text>
                    {order.order_status !== "canceled" && 
                     order.order_status !== "validated" && 
                     order.order_status !== "refused" && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        className="w-100"
                        style={{ borderColor: "#5700B4", color: "#5700B4" }}
                      >
                        Annuler la commande
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default Historique;