import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";

const Help = () => {
    const [helpRequests, setHelpRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch help requests from Supabase
    const fetchHelpRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('help')
                .select('*')
                .order('created_at', { ascending: false });  // Sort by latest requests
            
            if (error) throw error;

            setHelpRequests(data);
        } catch (err) {
            setError("Failed to fetch help requests.");
            console.error("Error fetching help requests:", err);
        } finally {
            setLoading(false);
        }
    };

    // Delete a help request
    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('help')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Remove the deleted request from state
            setHelpRequests(helpRequests.filter(request => request.id !== id));
            alert("Help request deleted successfully.");
        } catch (error) {
            console.error("Error deleting help request:", error);
            alert("Failed to delete help request.");
        }
    };

    // Mark request as resolved (optional feature)
    const handleMarkResolved = async (id) => {
        try {
            const { error } = await supabase
                .from('help')
                .update({ resolved: true })  // Add a 'resolved' column in your table
                .eq('id', id);

            if (error) throw error;

            // Update state to reflect the resolved status
            setHelpRequests(helpRequests.map(request =>
                request.id === id ? { ...request, resolved: true } : request
            ));
            alert("Help request marked as resolved.");
        } catch (error) {
            console.error("Error marking help request as resolved:", error);
            alert("Failed to mark help request as resolved.");
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchHelpRequests();
    }, []);

    return (
        <div>
            <div className="main-content container mx-auto px-4 py-8">
                <h1 style={{ color: "#000" }} className="text-3xl font-bold mb-4">Admin Helpdesk</h1>
                <p style={{ color: "#000" }} className="mb-8">Manage user help requests below.</p>

                {loading && <p>Loading help requests...</p>}
                {error && <p className="text-red-500">{error}</p>}

                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 border-b">ID</th>
                            <th className="px-6 py-3 border-b">Name</th>
                            <th className="px-6 py-3 border-b">Email</th>
                            <th className="px-6 py-3 border-b">Message</th>
                            <th className="px-6 py-3 border-b">Date Submitted</th>
                            <th className="px-6 py-3 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {helpRequests.map((request) => (
                            <tr key={request.id}>
                                <td className="px-6 py-4 border-b">{request.id}</td>
                                <td className="px-6 py-4 border-b">{request.name}</td>
                                <td className="px-6 py-4 border-b">{request.email}</td>
                                <td className="px-6 py-4 border-b">{request.message}</td>
                                <td className="px-6 py-4 border-b">{new Date(request.created_at).toLocaleString()}</td>
                                <td className="px-6 py-4 border-b flex space-x-2">
                                    {/* Only show "Mark Resolved" button if resolved is false */}
                                    {!request.resolved && (
                                        <button
                                            className="px-3 py-1 bg-green-600 text-white rounded"
                                            onClick={() => handleMarkResolved(request.id)}
                                        >
                                            Mark Resolved
                                        </button>
                                    )}
                                    <button
                                        className="px-3 py-1 bg-red-600 text-white rounded"
                                        onClick={() => handleDelete(request.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Help;
