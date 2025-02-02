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
        email: "",
        phone: "",
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

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
    
        try {

            if (registerData.referralId) {
                const { data: referringUser, error: referringUserError } = await supabase
                    .from("user_data")
                    .select("id")
                    .eq("id", registerData.referralId)
                    .single();

                if (referringUserError || !referringUser) {
                    setError("This referral ID doesn't exist");
                    setLoading(false);
                    return;
                }
            }

            const { data: existingUser, error: checkError } = await supabase
                .from("user_data")
                .select("id")
                .eq("identifier", registerData.identifier)
                .single();
    
            if (checkError && checkError.code !== "PGRST116") {
                throw new Error("Error checking identifier.");
            }
    
            if (existingUser) {
                setError("Username already exists.");
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
            <img src="Mencedes.svg" alt="Logo" className="login-logo" />
            {!isRegistering ? (
                <form onSubmit={handleLogin} className="login-form">
                    <h1 className="login-title">Login</h1>
                    <div className="form-control2">
                        <input
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)} 
                        />
                        <label>
                            <span style={{ transitionDelay: '0ms' }}>U</span>
                            <span style={{ transitionDelay: '50ms' }}>s</span>
                            <span style={{ transitionDelay: '100ms' }}>e</span>
                            <span style={{ transitionDelay: '150ms' }}>r</span>
                            <span style={{ transitionDelay: '200ms' }}>n</span>
                            <span style={{ transitionDelay: '250ms' }}>a</span>
                            <span style={{ transitionDelay: '300ms' }}>m</span>
                            <span style={{ transitionDelay: '350ms' }}>e</span>
                        </label>
                    </div>
                    <div className="password-input-containers">
                        <div className="form-control2">
                            <input
                                type={isPasswordVisible ? "text" : "password"}
                                name="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <label>
                                <span style={{ transitionDelay: '0ms' }}>P</span>
                                <span style={{ transitionDelay: '50ms' }}>a</span>
                                <span style={{ transitionDelay: '100ms' }}>s</span>
                                <span style={{ transitionDelay: '150ms' }}>s</span>
                                <span style={{ transitionDelay: '200ms' }}>w</span>
                                <span style={{ transitionDelay: '250ms' }}>o</span>
                                <span style={{ transitionDelay: '300ms' }}>r</span>
                                <span style={{ transitionDelay: '350ms' }}>d</span>
                            </label>
                        </div>
                        <span className="toggle-password" onClick={togglePasswordVisibility}>
                            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? <div className="spinner"></div> : "Login"}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                    <p className="switch-mode" onClick={() => setIsRegistering(true)}><span style={{ color: "gray" }}>Don't have an account?</span> Register</p>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="register-form">
                    <h1 className="register-title">Register</h1>
                        <div className="form-control2">
                            <input
                                type="text"
                                required
                                value={registerData.name}
                                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                            />
                            <label>
                                <span style={{ transitionDelay: '0ms' }}>F</span>
                                <span style={{ transitionDelay: '50ms' }}>u</span>
                                <span style={{ transitionDelay: '100ms' }}>l</span>
                                <span style={{ transitionDelay: '150ms' }}>l</span>
                                <span style={{ transitionDelay: '200ms' }}></span>
                                <span style={{ transitionDelay: '250ms' }}>N</span>
                                <span style={{ transitionDelay: '300ms' }}>a</span>
                                <span style={{ transitionDelay: '350ms' }}>m</span>
                                <span style={{ transitionDelay: '400ms' }}>e</span>
                            </label>
                        </div>
                        <div className="form-control2">
                            <input
                                type="text"
                                required
                                value={registerData.identifier}
                                onChange={(e) => setRegisterData({ ...registerData, identifier: e.target.value })}
                            />
                            <label>
                                <span style={{ transitionDelay: '0ms' }}>U</span>
                                <span style={{ transitionDelay: '50ms' }}>s</span>
                                <span style={{ transitionDelay: '100ms' }}>e</span>
                                <span style={{ transitionDelay: '150ms' }}>r</span>
                                <span style={{ transitionDelay: '200ms' }}>n</span>
                                <span style={{ transitionDelay: '250ms' }}>a</span>
                                <span style={{ transitionDelay: '300ms' }}>m</span>
                                <span style={{ transitionDelay: '350ms' }}>e</span>
                            </label>
                        </div>
                    <div className="password-input-containers">
                        <div className="form-control2">
                            <input
                                type={isPasswordVisible ? "text" : "password"}
                                name="password"
                                required
                                value={registerData.password}
                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            />
                            <label>
                                <span style={{ transitionDelay: '0ms' }}>P</span>
                                <span style={{ transitionDelay: '50ms' }}>a</span>
                                <span style={{ transitionDelay: '100ms' }}>s</span>
                                <span style={{ transitionDelay: '150ms' }}>s</span>
                                <span style={{ transitionDelay: '200ms' }}>w</span>
                                <span style={{ transitionDelay: '250ms' }}>o</span>
                                <span style={{ transitionDelay: '300ms' }}>r</span>
                                <span style={{ transitionDelay: '350ms' }}>d</span>
                            </label>
                        </div>
                        <span className="toggle-password" onClick={togglePasswordVisibility}>
                            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                        <div className="form-control2">
                            <input
                                type="text"
                                required
                                value={registerData.email}
                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            />
                            <label>
                                <span style={{ transitionDelay: '0ms' }}>E</span>
                                <span style={{ transitionDelay: '50ms' }}>m</span>
                                <span style={{ transitionDelay: '100ms' }}>a</span>
                                <span style={{ transitionDelay: '150ms' }}>i</span>
                                <span style={{ transitionDelay: '200ms' }}>l</span>
                            </label>
                        </div>
                        <div className="form-control2">
                            <input
                                type="text"
                                required
                                value={registerData.phone}
                                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                            />
                            <label>
                                <span style={{ transitionDelay: '0ms' }}>P</span>
                                <span style={{ transitionDelay: '50ms' }}>h</span>
                                <span style={{ transitionDelay: '100ms' }}>o</span>
                                <span style={{ transitionDelay: '150ms' }}>n</span>
                                <span style={{ transitionDelay: '200ms' }}>e</span>
                            </label>
                        </div>
                        <div className="form-control2">
                            <input
                                type="text"
                                required
                                value={registerData.referralId}
                                onChange={(e) => setRegisterData({ ...registerData, referralId: e.target.value })}
                            />
                            <label>
                                <span style={{ transitionDelay: '0ms' }}>R</span>
                                <span style={{ transitionDelay: '50ms' }}>e</span>
                                <span style={{ transitionDelay: '100ms' }}>f</span>
                                <span style={{ transitionDelay: '150ms' }}>e</span>
                                <span style={{ transitionDelay: '200ms' }}>r</span>
                                <span style={{ transitionDelay: '250ms' }}>r</span>
                                <span style={{ transitionDelay: '300ms' }}>a</span>
                                <span style={{ transitionDelay: '350ms' }}>l</span>
                                <span style={{ transitionDelay: '400ms' }}></span>
                                <span style={{ transitionDelay: '410ms' }}>I</span>
                                <span style={{ transitionDelay: '420ms' }}>D</span>
                            </label>
                        </div>
                    <button type="submit" className="register-button" disabled={loading}>
                        {loading ? <div className="spinner"></div> : "Register"}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                    <p className="switch-mode" onClick={() => setIsRegistering(false)}><span style={{ color: "gray" }}>Already have an account?</span> Login</p>
                </form>
            )}

            <p style={{ color: 'gray' }}>See <span  onClick={() => navigate("/privacy-policy")} className="switch-mode">Privacy Policy</span> or <span onClick={() => navigate("/terms-and-conditions")} className="switch-mode">Terms of Use</span></p>

            <button className="btn btn-secondary" onClick={() => navigate("/documentation")}>Documentation</button>

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