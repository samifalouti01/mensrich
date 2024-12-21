import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const ParrainagePayment = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState(""); // State to hold the message

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("order")
          .select("user_id, name, total_price, paid")
          .gte("total_price", 0);

        if (error) throw error;

        const groupedOrders = data.reduce((acc, order) => {
          const userId = order.user_id;

          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              total_price: 0,
              name: order.name || "Unknown User",
              paid: order.paid, // Track the paid status
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

  // Handle the "Pay" button click
  const handlePay = async (user_id) => {
    try {
      // Fetch the parrain_id from user_data table
      const { data: userData, error: userError } = await supabase
        .from("user_data")
        .select("parrain_id")
        .eq("id", user_id)
        .single();

      if (userError) throw userError;

      // If parrain_id exists, insert it into the pa_list table
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

        // Update the 'paid' column in the 'order' table
        const { error: updateError } = await supabase
          .from("order")
          .update({ paid: "paid" })
          .eq("user_id", user_id);

        if (updateError) throw updateError;

        setMessage("Payment processed, parrain_id added to pa_list, and order marked as paid."); // Set success message

        // Refresh the orders after payment
        const { data, error } = await supabase
          .from("order")
          .select("user_id, name, total_price, paid")
          .gte("total_price", 0);

        if (error) throw error;

        setOrders(data);
      } else {
        setMessage("No parrain_id found for this user."); // Set message if no parrain_id
      }
    } catch (error) {
      console.error("Error processing payment:", error); // Log the full error object
      setMessage(`Error processing payment. Please try again. Error: ${error.message}`); // Display the error message to the user
    }
  };

  return (
    <div>
      {/* Display the message */}
      {message && <div className="message">{message}</div>}

      <table>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Total Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.user_id}>
              <td>{order.name}</td>
              <td>
                {isNaN(order.total_price)
                  ? "N/A" // Display 'N/A' if total_price is not a number
                  : parseFloat(order.total_price).toFixed(2)} {/* Convert to number and fix decimals */}
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
