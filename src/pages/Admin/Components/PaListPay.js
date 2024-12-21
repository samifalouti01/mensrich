import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient"; // Adjust path as necessary

const PaListPay = () => {
  const [paList, setPaList] = useState([]);
  const [message, setMessage] = useState(""); // For displaying any message

  // Fetch data from pa_list table and get user details
  useEffect(() => {
    const fetchPaList = async () => {
      try {
        // Fetch the pa_list data
        const { data, error } = await supabase
          .from("pa_list")
          .select("id, user_id, parrain_id, created_at") // Add 'id' to identify records
          .order("created_at", { ascending: false }); // Sort by date if needed

        if (error) throw error;

        // For each entry in pa_list, fetch corresponding user data (name, rip)
        const updatedPaList = await Promise.all(
          data.map(async (item) => {
            const { parrain_id } = item;

            // Fetch user_data for the given parrain_id
            const { data: userData, error: userError } = await supabase
              .from("user_data")
              .select("name, rip")
              .eq("id", parrain_id?.split(",")[0]) // Ensure we check for the correct ID (split in case it's a list)
              .single(); // Get a single record (if it exists)

            if (userError) {
              console.error("Error fetching user data:", userError);
            }

            // Return the original item along with the user's name and rip
            return {
              ...item,
              name: userData?.name || "Unknown",
              rip: userData?.rip || "Unknown",
            };
          })
        );

        // Update state with the fetched data (including user name and rip)
        setPaList(updatedPaList);
      } catch (error) {
        console.error("Error fetching pa_list:", error);
        setMessage("Error fetching data from pa_list. Please try again.");
      }
    };

    fetchPaList();
  }, []);

  // Handle deletion of a pa_list item
  const handleDelete = async (id) => {
    try {
      // Delete the record from the pa_list table
      const { error } = await supabase
        .from("pa_list")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Remove the deleted item from the state to update the UI
      setPaList(paList.filter((item) => item.id !== id));
      setMessage("Record deleted successfully.");
    } catch (error) {
      console.error("Error deleting record:", error);
      setMessage("Error deleting the record. Please try again.");
    }
  };

  return (
    <div>
      {/* Display any messages */}
      {message && <div className="message">{message}</div>}

      <h2>Pa List</h2>
      <table>
        <thead>
          <tr>
            <th>Parrain ID</th>
            <th>Name</th>
            <th>RIP</th>
            <th>Get</th>
            <th>Created At</th>
            <th>Actions</th> {/* Column for the delete button */}
          </tr>
        </thead>
        <tbody>
          {paList.length > 0 ? (
            paList.map((item) => (
              <tr key={item.id}> {/* Use unique id for key */}
                <td>{item.parrain_id?.split(",")[0]}</td>
                <td>{item.name}</td>
                <td>{item.rip}</td>
                <td>1500 DA</td>
                <td>{new Date(item.created_at).toLocaleString()}</td> {/* Format created_at */}
                <td>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ color: "red" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No data available</td> {/* Adjusted colspan to 5 */}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaListPay;
