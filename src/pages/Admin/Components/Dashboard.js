import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient"; // Ensure your Supabase client is set up
import "./Dashboard.css"; // Add CSS for styling
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [data, setData] = useState({
        income: 0,
        totalUsers: 0,
        activeUsers: 0,
        animateursAdjoints: 0,
        animateurs: 0,
        managersAdjoints: 0,
        managers: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch total users
                const { count: totalUsers } = await supabase
                    .from("user_data")
                    .select("*", { count: "exact", head: true });

                // Fetch active users
                const { count: activeUsers, error: activeUsersError } = await supabase
                    .from("user_data")
                    .select("*", { count: "exact", head: true })
                    .gte("perso", "100")

                if (activeUsersError) {
                    console.error("Error fetching active users:", activeUsersError.message);
                } else {
                    console.log("Active Users Count (perso > 100):", activeUsers);
                }

                // Fetch income from the "public.order" table
                const { data: ordersData, error: ordersError } = await supabase
                .from("order")
                .select("total_price")
                .eq("order_status", "validé");

            if (ordersError) throw ordersError;

            // Calculate total income
            const income = ordersData.reduce((sum, order) => sum + parseFloat(order.total_price || 0) * 100, 0);

                // Fetch role-based counts
                const roles = ["Animateurs Adjoints", "Animateurs", "Managers Adjoints", "Managers"];
            const roleCounts = {};
            for (const role of roles) {
                const { count } = await supabase
                    .from("user_data")
                    .select("*", { count: "exact", head: true })
                    .eq("role", role);
                roleCounts[role.toLowerCase().replace(" ", "")] = count || 0;
            }

            // Calculate level counts based on points
            const { data: userPoints } = await supabase
                .from("history_data")
                .select("ppcg"); // Fetch ppcg instead of points

            const levelCounts = {
                Distributeur: 0,
                "Animateur Adjoint": 0,
                Animateur: 0,
                "Manager Adjoint": 0,
                Manager: 0,
            };

            userPoints.forEach((user) => {
                const ppcg = user.ppcg || 0; // Default to 0 if ppcg is undefined
                if (ppcg >= 30000) {
                    levelCounts.Manager++;
                } else if (ppcg >= 18700) {
                    levelCounts["Manager Adjoint"]++;
                } else if (ppcg >= 6250) {
                    levelCounts.Animateur++;
                } else if (ppcg >= 100) {
                    levelCounts["Animateur Adjoint"]++;
                } else {
                    levelCounts.Distributeur++;
                }
            });


                // Set data state
                setData((prevState) => ({
                    ...prevState,
                    income,
                    totalUsers,
                    activeUsers,
                    animateursAdjoints: roleCounts["animateursadjoints"],
                    animateurs: roleCounts["animateurs"],
                    managersAdjoints: roleCounts["managersadjoints"],
                    managers: roleCounts["managers"],
                    ...levelCounts, // Spread level counts into the state
                }));
            } catch (error) {
                console.error("Error fetching data:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <p style={{ color: "black" }}>Loading dashboard data...</p>;
    }

    const chartData = {
        labels: ['Distributeur', 'Animateur AD', 'Animateur', 'Manager AD', 'Manager'],
        datasets: [
            {
                label: 'User Count',
                data: [
                    data.Distributeur,
                    data["Animateur Adjoint"],
                    data.Animateur,
                    data["Manager Adjoint"],
                    data.Manager,
                ],
                backgroundColor: [
                    'rgba(127, 140, 141)',
                    'rgba(142, 68, 173)', 
                    'rgba(52, 73, 94)', 
                    'rgba(230, 126, 34)', 
                    'rgba(231, 76, 60)', 
                ],
                borderColor: [
                    'rgba(127, 140, 141)', 
                    'rgba(142, 68, 173)', 
                    'rgba(52, 73, 94)', 
                    'rgba(230, 126, 34)', 
                    'rgba(231, 76, 60)', 
                ],
                borderWidth: 1,
                borderRadius: 10,
            },
        ],
    };
    

    return (
        <div className="dashboard">
            <div className="dashboard-grid">
                <div className="card card-income">
                    <h3>Income</h3>
                    <br />
                    <p>{data.income.toLocaleString()} DA</p>
                </div>
                <div className="card card-users">
                    <h3>Total Users</h3>
                    <br />
                    <p>{data.totalUsers}</p>
                </div>
                <div className="card card-active">
                    <h3>Active Users</h3>
                    <br />
                    <p>{data.activeUsers}</p>
                </div>
                <div className="card card-distributeurs">
                    <h3>Distributeur</h3>
                    <br />
                    <p>{data.Distributeur}</p>
                </div>
                <div className="card card-adjoints">
                    <h3>Animateur AD</h3>
                    <br />
                    <p>{data["Animateur Adjoint"]}</p>
                </div>
                <div className="card card-animateurs">
                    <h3>Animateur</h3>
                    <br />
                    <p>{data.Animateur}</p>
                </div>
                <div className="card card-managers-adjoints">
                    <h3>Manager AD</h3>
                    <br />
                    <p>{data["Manager Adjoint"]}</p>
                </div>
                <div className="card card-managers">
                    <h3>Manager</h3>
                    <br />
                    <p>{data.Manager}</p>
                </div>
            </div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <div className="chart-container">
                <h3>Role Distribution</h3>
                <Bar data={chartData} />
            </div>
        </div>
    );
};

export default Dashboard;
