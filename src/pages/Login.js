import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        console.log("Toggle password visibility clicked!");
        setIsPasswordVisible(!isPasswordVisible);
    };
    

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { data, error } = await supabase
            .from("user_data")
            .select("id, identifier, name, blocked")
            .eq("identifier", identifier)
            .eq("password", password);

        setLoading(false);

        if (error || data.length === 0) {
            setError("Invalid username or password");
        } else {
            const user = data[0];

            // Check if the account is blocked
            if (user.blocked === "blocked") {
                setError("Your account has been blocked");
            } else {
                localStorage.setItem("user", JSON.stringify(user)); 

                // Navigate based on identifier
                if (identifier.includes("company.khademni")) {
                    navigate("/admin-panel"); // Adjust path to AdminPanel.js route
                } else {
                    navigate("/dashboard");
                }
            }
        }
    };

    return (
        <div className="login-container">
            <img src="Mencedes.svg" alt="Logo" className="login-logo" />
            <form onSubmit={handleLogin} className="login-form">
                <h1 className="login-title">Login</h1>
                <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ID Numérique"
                    className="login-input"
                    required
                />
                <div className="password-input-containers">
                    <input
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="Mot de Passe"
                        className="password-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                    <span className="toggle-password" onClick={togglePasswordVisibility}>
                        {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? <div className="spinner"></div> : "Login"}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default Login;
