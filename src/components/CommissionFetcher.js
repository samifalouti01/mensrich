import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Make sure to import supabase client

const CommissionFetcher = ({ userId }) => {
  const [commission, setCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommissionData = async () => {
      try {
        // Fetch all orders for the current user
        const { data, error } = await supabase
          .from('order')
          .select('commission')
          .eq('user_id', userId); // Match with the current user's ID

        if (error) {
          throw error;
        }

        // Sum up all the commission values
        const totalCommission = data.reduce((sum, row) => sum + (Number(row.commission) || 0), 0);
        setCommission(totalCommission);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCommissionData();
    }
  }, [userId]);

  if (loading) {
    return <p>Loading commission data...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return <p>{(commission).toFixed(2)} DA</p>;
};

export default CommissionFetcher;
