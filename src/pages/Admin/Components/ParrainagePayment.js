import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const ParrainagePayment = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch orders with validated status
        const { data: orderData, error: orderError } = await supabase
          .from("order")
          .select("user_id, total_price, paid, order_status")
          .gte("total_price", 0)
          .eq("order_status", "validated");

        if (orderError) throw orderError;

        // Get unique user IDs
        const userIds = [...new Set(orderData.map(order => order.user_id))];

        // Fetch user names from user_data
        const { data: userData, error: userError } = await supabase
          .from("user_data")
          .select("id, name")
          .in("id", userIds);

        if (userError) throw userError;

        // Create a map of user_id to name
        const userMap = userData.reduce((acc, user) => {
          acc[user.id] = user.name || "Unknown User";
          return acc;
        }, {});

        // Group and process orders
        const groupedOrders = orderData.reduce((acc, order) => {
          const userId = order.user_id;

          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              name: userMap[userId], // Add name from user_data
              total_price: 0,
              paid: order.paid,
            };
          }

          acc[userId].total_price += parseFloat(order.total_price);

          return acc;
        }, {});

        const totalOrders = Object.values(groupedOrders);
        const filteredOrders = totalOrders.filter(order => order.total_price <= 120);

        setOrders(filteredOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handlePay = async (user_id) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("user_data")
        .select("parrain_id, name")
        .eq("id", user_id) // Changed from eq("name") to eq("id")
        .single();

      if (userError) throw userError;

      if (userData && userData.parrain_id) {
        const { error: insertError } = await supabase
          .from("pa_list")
          .insert([
            {
              parrain_id: userData.parrain_id,
              user_id: user_id,
            },
          ]);

        if (insertError) throw insertError;

        const { error: updateError } = await supabase
          .from("order")
          .update({ paid: "paid" })
          .eq("user_id", user_id)
          .eq("order_status", "validated");

        if (updateError) throw updateError;

        setMessage("Payment processed, parrain_id added to pa_list, and order marked as paid.");

        // Refresh data after payment
        const { data: orderData, error: orderError } = await supabase
          .from("order")
          .select("user_id, total_price, paid, order_status")
          .gte("total_price", 0)
          .eq("order_status", "validated");

        if (orderError) throw orderError;

        const userIds = [...new Set(orderData.map(order => order.user_id))];
        const { data: userDataRefresh, error: userError } = await supabase
          .from("user_data")
          .select("id, name")
          .in("id", userIds);

        if (userError) throw userError;

        const userMap = userDataRefresh.reduce((acc, user) => {
          acc[user.id] = user.name || "Unknown User";
          return acc;
        }, {});

        const groupedOrders = orderData.reduce((acc, order) => {
          const userId = order.user_id;

          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              name: userMap[userId],
              total_price: 0,
              paid: order.paid,
            };
          }

          acc[userId].total_price += parseFloat(order.total_price);

          return acc;
        }, {});

        const totalOrders = Object.values(groupedOrders);
        const filteredOrders = totalOrders.filter(order => order.total_price <= 120);
        setOrders(filteredOrders);
      } else {
        setMessage("No parrain_id found for this user.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setMessage(`Error processing payment. Please try again. Error: ${error.message}`);
    }
  };

  return (
    <div>
      {message && <div className="message">{message}</div>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.user_id}>
              <td>{order.name}</td> {/* Changed from user_id.name to order.name */}
              <td>
                {isNaN(order.total_price)
                  ? "N/A"
                  : parseFloat(order.total_price).toFixed(2)}
              </td>
              <td>
                {order.paid !== "paid" ? (
                  <button onClick={() => handlePay(order.user_id)}>Pay</button>
                ) : (
                  "Paid"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParrainagePayment;