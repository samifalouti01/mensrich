import React, { useEffect, useState } from 'react';
import { supabase } from "../../../supabaseClient";
import './Order.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');  // State for search query

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

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    return (
      order.id.toString().includes(searchQuery) ||
      (order.name && order.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.email && order.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleValidate = async (orderId, userId, currentTotalPrice) => {
    try {
      // Fetch user data for the order
      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('perso, ppcg, parrain_id')
        .eq('id', userId)
        .single();
    
      if (userError) {
        if (userError.code === 'PGRST116') {
          setError(`No user found for user_id: ${userId}`);
        } else {
          throw userError;
        }
        return;
      }
  
      const currentPersoValue = parseFloat(userData.perso) || 0;
      const currentPrice = parseFloat(currentTotalPrice) || 0;
      const newPersoValue = currentPersoValue + currentPrice;
  
      const currentPpcgValue = parseFloat(userData.ppcg) || 0;
      const newPpcgValue = currentPpcgValue + currentPrice;
  
      // Log values to check if the calculations are correct
      console.log(`User Data for ID ${userId}:`, userData);
      console.log(`Updating perso: ${currentPersoValue} + ${currentPrice} = ${newPersoValue}`);
      console.log(`Updating ppcg: ${currentPpcgValue} + ${currentPrice} = ${newPpcgValue}`);
  
      // Update the order status to 'validé'
      const { error: updateOrderError } = await supabase
        .from('order')
        .update({ order_status: 'validé' })
        .eq('id', orderId);
    
      if (updateOrderError) {
        throw updateOrderError;
      }
    
      // Update the user's perso and ppcg values
      const { error: updateUserError } = await supabase
        .from('user_data')
        .update({
          perso: newPersoValue.toString(),
          ppcg: newPpcgValue.toString(),
        })
        .eq('id', userId);
    
      if (updateUserError) {
        throw updateUserError;
      }
    
      // Check if the user has parrain_ids
      if (userData.parrain_id) {
        // Split the parrain_id and filter out any invalid or empty entries
        const parrainIds = userData.parrain_id
          .split(',')
          .map(id => id.trim())
          .filter(id => id && !isNaN(id)); // Remove empty and non-numeric values
  
        console.log(`User has valid parrain_ids: ${parrainIds}`);
    
        // If there are no valid parrain_ids, skip the update process
        if (parrainIds.length === 0) {
          console.log('No valid parrain_ids to update.');
          return;
        }
  
        // Fetch all parrains' data
        const { data: parrainsData, error: parrainsError } = await supabase
          .from('user_data')
          .select('id, parainage_points, ppcg')
          .in('id', parrainIds);
    
        if (parrainsError) {
          throw parrainsError;
        }
  
        // Log parrains data
        console.log("Parrains Data:", parrainsData);
    
        // Loop through each parrain and update their data
        for (const parrain of parrainsData) {
          const currentParainagePoints = parseFloat(parrain.parainage_points) || 0;
          const currentPpcgValue = parseFloat(parrain.ppcg) || 0;
    
          const newParainagePoints = currentParainagePoints + currentPrice;
          const newPpcgValue = currentPpcgValue + currentPrice;
    
          // Log update data for each parrain
          console.log(`Updating parrain ID ${parrain.id}:`);
          console.log(`Parainage Points: ${currentParainagePoints} + ${currentPrice} = ${newParainagePoints}`);
          console.log(`PPCG: ${currentPpcgValue} + ${currentPrice} = ${newPpcgValue}`);
    
          // Update the parrain's parainage_points and ppcg
          const { error: updateParrainError } = await supabase
            .from('user_data')
            .update({
              parainage_points: newParainagePoints.toString(),
              ppcg: newPpcgValue.toString(),
            })
            .eq('id', parrain.id);
    
          if (updateParrainError) {
            throw updateParrainError;
          }
        }
      }
    
      // Update the order status in the frontend
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === orderId) {
          return { ...order, order_status: 'validé' };
        }
        return order;
      }));
    
    } catch (error) {
      setError(error.message);
    }
  };  

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImage(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const isValidImageUrl = (url) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);  // Check for common image extensions
  };

  return (
    <div>
      {/* Search Bar */}
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
            <th>Created At</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Product Ref</th>
            <th>Reçu</th>
            <th>Total Price</th>
            <th>Order Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{new Date(order.created_at).toLocaleString()}</td>
              <td>{order.name}</td>
              <td>{order.phone}</td>
              <td>{order.product_ref}</td>
              <td>
                {order.receipt && isValidImageUrl(order.receipt) ? (
                  <img
                    src={order.receipt}
                    alt={`${order.name}`}
                    style={{ width: '100px', height: 'auto', cursor: 'pointer' }}
                    onClick={() => openModal(order.receipt)}
                  />
                ) : (
                  <span>{order.receipt}</span> 
                )}
              </td>
              <td>{order.total_price * 100} DA</td>
              <td>{order.order_status}</td>
              <td>
                {order.order_status !== 'validé' && order.userData ? (
                  <button onClick={() => handleValidate(order.id, order.user_id, order.total_price)}>
                    Validate
                  </button>
                ) : (
                  <span style={{ color: '#007bff' }}>{order.userData ? 'Validated' : 'User not found'}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <img src={modalImage} alt={`Full-size view of ${modalImage}`} className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
