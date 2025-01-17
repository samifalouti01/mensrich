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
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerData, setRegisterData] = useState({
        name: "",
        identifier: "",
        password: "",
        referralId: "",
        validate: "unvalidate",
    });
    const [showPopup, setShowPopup] = useState(false);

    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
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
            if (user.blocked === "blocked") {
                setError("Your account has been blocked");
            } else {
                localStorage.setItem("user", JSON.stringify(user));
                identifier.includes("company.mensrich") ? navigate("/admin-panel") : navigate("/dashboard");
            }
        }
    };

    const isValidIdentifier = (identifier) => {
         const prefix = "MR"; 
         if (!identifier.startsWith(prefix)) 
            return false; const numericPart = identifier.slice(prefix.length); 
        return /^\d{9,13}$/.test(numericPart);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!isValidIdentifier(registerData.identifier)) { 
            setError("Identifier must start with 'MR' followed by 9 to 13 digits."); 
            setLoading(false); return;
        }
    
        try {
            const { data: existingUser, error: checkError } = await supabase
                .from("user_data")
                .select("id")
                .eq("identifier", registerData.identifier)
                .single();
    
            if (checkError && checkError.code !== "PGRST116") {
                throw new Error("Error checking identifier.");
            }
    
            if (existingUser) {
                setError("Identifier already exists.");
                setLoading(false);
                return;
            }
    
            let combinedParrainId = registerData.referralId || null; 
    
            if (registerData.referralId) {
                const { data: referringUser, error: referringUserError } = await supabase
                    .from("user_data")
                    .select("parrain_id, parainage_users")
                    .eq("id", registerData.referralId)
                    .single();
    
                if (referringUserError) {
                    throw new Error("Invalid referral ID.");
                }
    
                if (referringUser.parrain_id) {
                    combinedParrainId = `${registerData.referralId},${referringUser.parrain_id}`;
                }
    
                const updatedParainageUsers = (parseInt(referringUser.parainage_users || "0", 10) + 1);
    
                const { error: updateReferralError } = await supabase
                    .from("user_data")
                    .update({ parainage_users: updatedParainageUsers })
                    .eq("id", registerData.referralId);
    
                if (updateReferralError) {
                    throw new Error("Failed to update referring user's referral count.");
                }
            }
    
            const newUser = {
                name: registerData.name,
                identifier: registerData.identifier,
                password: registerData.password,
                parrain_id: combinedParrainId,
                perso: 0,
                parainage_points: 0,
                parainage_users: 0, 
                ppcg: 0,
                validate: registerData.validate,
            };
    
            // Insert the new user and get their ID
            const { data: insertedUser, error: insertError } = await supabase
                .from("user_data")
                .insert([newUser])
                .select('id')
                .single();
    
            if (insertError) throw insertError;
    
            // Create history_data record
            const { error: historyError } = await supabase
                .from("history_data")
                .insert([{
                    id: insertedUser.id,
                    perso: 0,
                    parainage_points: 0,
                    parainage_users: 0,
                    ppcg: 0
                }]);
    
            if (historyError) throw new Error("Failed to create history record");
    
            // Create first_month record
            const { error: firstMonthError } = await supabase
                .from("first_month")
                .insert([{
                    id: insertedUser.id,
                    ppcg: 0,
                    perso: 0
                }]);
    
            if (firstMonthError) throw new Error("Failed to create first month record");
    
            setShowPopup(true);
        } catch (err) {
            setError(`Failed to register: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="login-container">
            {!isRegistering ? (
                <form onSubmit={handleLogin} className="login-form">
                    <img src="Mencedes.svg" alt="Logo" className="login-logo" />
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
                            placeholder="Password"
                            name="password"
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
                    <p className="switch-mode" onClick={() => setIsRegistering(true)}><span style={{ color: "gray" }}>Don't have an account?</span> Register</p>
                    <p style={{ color: 'gray' }}>See <span  onClick={() => navigate("/privacy-policy")} className="switch-mode">Privacy Policy</span> or <span onClick={() => navigate("/terms-and-conditions")} className="switch-mode">Terms of Use</span></p>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="register-form">
                    <img src="Mencedes.svg" alt="Logo" className="login-logo" />
                    <h1 className="register-title">Register</h1>
                    <input
                        type="text"
                        placeholder="Name"
                        className="register-input"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Identifier"
                        className="register-input"
                        value={registerData.identifier}
                        onChange={(e) => {
                            let value = e.target.value;
                            if (!value.startsWith("MR")) {
                            value = "MR" + value;
                            }
                            const numericPart = value.slice(2); // Extract the numeric part after "MR"
                            if (!/^\d{0,13}$/.test(numericPart)) { // Allow only up to 13 digits
                            return; // Reject the change if it doesn't match the pattern
                            }
                            setRegisterData({ ...registerData, identifier: value });
                        }}
                        required
                    />
                    <div className="password-input-containers">
                        <input
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder="Password"
                            name="password"
                            className="password-input"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            required
                        />
                        <span className="toggle-password" onClick={togglePasswordVisibility}>
                            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <input
                        type="text"
                        placeholder="Referral ID"
                        className="register-input"
                        value={registerData.referralId}
                        onChange={(e) => setRegisterData({ ...registerData, referralId: e.target.value })}
                    />
                    <button type="submit" className="register-button" disabled={loading}>
                        {loading ? <div className="spinner"></div> : "Register"}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                    <p className="switch-mode" onClick={() => setIsRegistering(false)}><span style={{ color: "gray" }}>Already have an account?</span> Login</p>
                </form>
            )}
            {showPopup && (
                <div className="popup">
                    <h3 style={{ color: "green" }}>Registration Successful!</h3>
                    <p style={{ color: "black" }}>ID: {registerData.identifier}</p>
                    <p style={{ color: "black" }}>Password: {registerData.password}</p>
                    <button onClick={() => setShowPopup(false)}>Close</button>
                </div>
            )}
        </div>
    );    
};

export default Login;