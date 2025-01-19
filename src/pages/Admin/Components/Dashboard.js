import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient"; 
import "./Dashboard.css"; 
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [data, setData] = useState({
        income: 0,
        totalUsers: 0,
        activeUsers: 0,
        animateurs: 0,
        animateursJuniors: 0,
        animateursSeniors: 0,
        managers: 0,
        managersJuniors: 0,
        managersSeniors: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const { count: totalUsers } = await supabase
                    .from("user_data")
                    .select("*", { count: "exact", head: true });

                const { count: activeUsers, error: activeUsersError } = await supabase
                    .from("user_data")
                    .select("*", { count: "exact", head: true })
                    .gte("perso", "100")

                if (activeUsersError) {
                    console.error("Error fetching active users:", activeUsersError.message);
                } else {
                    console.log("Active Users Count (perso > 100):", activeUsers);
                }

                const { data: ordersData, error: ordersError } = await supabase
                .from("order")
                .select("total_price")
                .eq("order_status", "validated");

            if (ordersError) throw ordersError;

            const income = ordersData.reduce((sum, order) => sum + parseFloat(order.total_price || 0) * 100, 0);

                const roles = ["Animateur", "Animateur Junior", "Animateur Senior", "Manager", "Manager Junior", "Manager Senior"];
            const roleCounts = {};
            for (const role of roles) {
                const { count } = await supabase
                    .from("user_data")
                    .select("*", { count: "exact", head: true })
                    .eq("role", role);
                roleCounts[role.toLowerCase().replace(" ", "")] = count || 0;
            }

            const { data: userPoints } = await supabase
                .from("history_data")
                .select("ppcg"); 

            const levelCounts = {
                Distributeur: 0,
                Animateur: 0,
                "Animateur Junior": 0,
                "Animateur Senior": 0,
                Manager: 0,
                "Manager Junior": 0,
                "Manager Senior": 0,
            };

            userPoints.forEach((user) => {
                const ppcg = user.ppcg || 0; 
                if (ppcg >= 50000) {
                    levelCounts["Manager Senior"]++;
                } else if (ppcg >= 30000) {
                    levelCounts["Manager Junior"]++;
                } else if (ppcg >= 18700) {
                    levelCounts.Manager++;
                } else if (ppcg >= 12500) {
                    levelCounts["Animateur Senior"]++;
                } else if (ppcg >= 6250) {
                    levelCounts["Animateur Junior"]++;
                } else if (ppcg >= 100) {
                    levelCounts.Animateur++;
                } else {
                    levelCounts.Distributeur++;
                }
            });


                setData((prevState) => ({
                    ...prevState,
                    income,
                    totalUsers,
                    activeUsers,
                    animateurs: roleCounts["animateurs"],
                    animateursJuniors: roleCounts["animateursjuniors"],
                    animateursSeniors: roleCounts["animateurssenior"],
                    managers: roleCounts["managers"],
                    managersJuniors: roleCounts["managersjuniors"],
                    managersSeniors: roleCounts["managerseniors"],
                    ...levelCounts, 
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
        labels: ['Distributeur', 'Animateur', 'Animateur Junior', 'Animateur Senior', 'Manager', 'Manager Junior', 'Manager Senior'],
        datasets: [
            {
                label: 'User Count',
                data: [
                    data.Distributeur,
                    data.Animateur,
                    data["Animateur Junior"],
                    data["Animateur Senior"],
                    data.Manager,
                    data["Manager Junior"],
                    data["Manager Senior"],
                ],
                backgroundColor: [
                    'rgba(127, 140, 141, 0.6)', // Gray
                    'rgba(142, 68, 173, 0.6)', // Purple
                    'rgba(52, 73, 94, 0.6)', // Dark Blue
                    'rgba(230, 126, 34, 0.6)', // Orange
                    'rgba(231, 76, 60, 0.6)', // Red
                    'rgba(46, 204, 113, 0.6)', // Green
                    'rgba(52, 152, 219, 0.6)', // Light Blue
                    'rgba(155, 89, 182, 0.6)', // Lavender
                    'rgba(241, 196, 15, 0.6)', // Yellow
                    'rgba(39, 174, 96, 0.6)', // Emerald
                ],
                borderColor: [
                    'rgba(127, 140, 141, 1)', // Gray
                    'rgba(142, 68, 173, 1)', // Purple
                    'rgba(52, 73, 94, 1)', // Dark Blue
                    'rgba(230, 126, 34, 1)', // Orange
                    'rgba(231, 76, 60, 1)', // Red
                    'rgba(46, 204, 113, 1)', // Green
                    'rgba(52, 152, 219, 1)', // Light Blue
                    'rgba(155, 89, 182, 1)', // Lavender
                    'rgba(241, 196, 15, 1)', // Yellow
                    'rgba(39, 174, 96, 1)', // Emerald
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
                    <h3>Animateur</h3>
                    <br />
                    <p>{data.Animateur}</p>
                </div>
                <div className="card card-juniorA">
                    <h3>Animateur Junior</h3>
                    <br />
                    <p>{data["Animateur Junior"]}</p>
                </div>
                <div className="card card-SeniorA">
                    <h3>Animateur Senior</h3>
                    <br />
                    <p>{data["Animateur Senior"]}</p>
                </div>
                <div className="card card-managers">
                    <h3>Manager</h3>
                    <br />
                    <p>{data.Manager}</p>
                </div>
                <div className="card card-juniorM">
                    <h3>Manager Junior</h3>
                    <br />
                    <p>{data["Manager Junior"]}</p>
                </div>
                <div className="card card-SeniorM">
                    <h3>Manager Senior</h3>
                    <br />
                    <p>{data["Manager Senior"]}</p>
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
