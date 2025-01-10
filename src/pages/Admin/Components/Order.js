import React, { useEffect, useState } from 'react';
import { supabase } from "../../../supabaseClient";
import './Order.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('order')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) {
          throw ordersError;
        }

        const ordersWithUserData = await Promise.all(ordersData.map(async (order) => {
          const { data: userData, error: userError } = await supabase
            .from('user_data')
            .select('perso, ppcg')
            .eq('id', order.user_id)
            .single();

          if (userError) {
            order.userData = null;
            if (userError.code === 'PGRST116') {
              setError(`No user found for user_id: ${order.user_id}`);
            } else {
              throw userError;
            }
          } else {
            order.userData = userData;
          }
          return order;
        }));

        setOrders(ordersWithUserData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleActionChange = async (orderId, action) => {
    try {
      const { error } = await supabase
        .from('order')
        .update({ order_status: action })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, order_status: action } : order
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredOrders = orders.filter((order) => {
    return (
      order.id.toString().includes(searchQuery) ||
      (order.name && order.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.email && order.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImage(null);
  };

  const isValidImageUrl = (url) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search by ID, Name, or Email"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginBottom: '20px', padding: '8px', width: '100%' }}
      />

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Image</th>
            <th>Created At</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Total Price</th>
            <th>Wilaya</th>
            <th>Commune</th>
            <th>Address</th>
            <th>Order Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>
              {order.product_image ? (
                <img
                  src={order.product_image}
                  alt={order.name || "Product Image"}
                  onError={(e) => (e.target.style.display = "none")} // Handle broken images
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => openModal(order.product_image)}
                />
              ) : (
                <span>No Image</span>
              )}
            </td>
              <td>{new Date(order.created_at).toLocaleString()}</td>
              <td>{order.name}</td>
              <td>{order.phone}</td>
              <td>{order.total_price * 100} DA</td>
              <td>{order.wilaya}</td>
              <td>{order.commune}</td>
              <td>{order.address}</td>
              <td>{order.order_status}</td>
              <td>
                <select
                  value={order.order_status}
                  onChange={(e) => handleActionChange(order.id, e.target.value)}
                  style={{ padding: '5px', borderRadius: '5px' }}
                >
                  <option value="validé">Valider</option>
                  <option value="refusé">Refuser</option>
                  <option value="annulé">Annuler</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <img
              src={modalImage}
              alt={`Full-size view of ${modalImage}`}
              className="modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
