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

        if (identifier.includes(" ")) {
            setError("لا يمكن أن يحتوي اسم المستخدم على مسافات.");
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from("user_data")
            .select("id, identifier, name, blocked")
            .eq("identifier", identifier)
            .eq("password", password);

        setLoading(false);

        if (error || data.length === 0) {
            setError("اسم المستخدم أو كلمة المرور غير صالحة");
        } else {
            const user = data[0];
            if (user.blocked === "blocked") {
                setError("لقد تم حظر حسابك. يرجى التواصل مع الادارة.");
            } else {
                localStorage.setItem("user", JSON.stringify(user));
                identifier.includes("company.mensrich") ? navigate("/admin-panel") : navigate("/dashboard");
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (registerData.identifier.includes(" ")) {
            setError("لا يمكن أن يحتوي اسم المستخدم على مسافات.");
            return;
        }

        setLoading(true);
    
        try {
            // تحقق من الـ referral ID إذا كان موجود
            if (registerData.referralId) {
                const { data: referringUser, error: referringUserError } = await supabase
                    .from("user_data")
                    .select("id")
                    .eq("id", registerData.referralId)
                    .single();
    
                if (referringUserError || !referringUser) {
                    setError("معرف الإحالة هذا غير موجود");
                    setLoading(false);
                    return;
                }
            }
    
            // تحقق من إذا كان الـ identifier موجود بالفعل
            const { data: existingUser, error: checkError } = await supabase
                .from("user_data")
                .select("id")
                .eq("identifier", registerData.identifier)
                .single();
    
            if (checkError && checkError.code !== "PGRST116") {
                throw new Error("خطأ في التحقق من المعرف.");
            }
    
            if (existingUser) {
                setError("اسم المستخدم موجود مسبقاً.");
                setLoading(false);
                return;
            }
    
            let combinedParrainId = registerData.referralId || null;
    
            // إدارة parrain_id وتحديث عدد الإحالات إذا كان فيه referral
            if (registerData.referralId) {
                const { data: referringUser } = await supabase
                    .from("user_data")
                    .select("parrain_id, parainage_users")
                    .eq("id", registerData.referralId)
                    .single();
    
                if (referringUser.parrain_id) {
                    combinedParrainId = `${registerData.referralId},${referringUser.parrain_id}`;
                }
    
                const updatedParainageUsers = parseInt(referringUser.parainage_users || "0", 10) + 1;
    
                await supabase
                    .from("user_data")
                    .update({ parainage_users: updatedParainageUsers })
                    .eq("id", registerData.referralId);
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
                email: registerData.email,
                phone: registerData.phone,
                validate: registerData.validate,
            };
    
            // إضافة المستخدم الجديد وجلب الـ ID
            const { data: insertedUser, error: insertError } = await supabase
                .from("user_data")
                .insert([newUser])
                .select('id')
                .single();
    
            if (insertError) throw insertError;
    
            // إنشاء history_data
            await supabase.from("history_data").insert([{
                id: insertedUser.id,
                perso: 0,
                parainage_points: 0,
                parainage_users: 0,
                ppcg: 0
            }]);
    
            // إنشاء first_month record
            await supabase.from("first_month").insert([{
                id: insertedUser.id,
                ppcg: 0,
                perso: 0
            }]);
    
            // تسجيل المستخدم في `localStorage` وتحويله مباشرة إلى `/dashboard`
            localStorage.setItem("user", JSON.stringify(insertedUser));
            navigate("/dashboard");
    
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
                    <h1 className="login-title">تسجيل الدخول</h1>
                    <div className="form-control2">
                        <input
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value.replace(/\s/g, ""))} 
                        />
                        <label>
                            <span style={{ transitionDelay: '0ms' }}>ا</span>
                            <span style={{ transitionDelay: '50ms' }}>سـ</span>
                            <span style={{ transitionDelay: '100ms' }}>م</span>
                            <span style={{ transitionDelay: '150ms' }}></span>
                            <span style={{ transitionDelay: '200ms' }}>ا</span>
                            <span style={{ transitionDelay: '250ms' }}>لـ</span>
                            <span style={{ transitionDelay: '300ms' }}>مـ</span>
                            <span style={{ transitionDelay: '350ms' }}>سـ</span>
                            <span style={{ transitionDelay: '400ms' }}>تـ</span>
                            <span style={{ transitionDelay: '450ms' }}>خـ</span>
                            <span style={{ transitionDelay: '500ms' }}>د</span>
                            <span style={{ transitionDelay: '550ms' }}>م</span>
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
                                <span style={{ transitionDelay: '0ms' }}>كـ</span>
                                <span style={{ transitionDelay: '50ms' }}>لـ</span>
                                <span style={{ transitionDelay: '100ms' }}>مـ</span>
                                <span style={{ transitionDelay: '150ms' }}>ة</span>
                                <span style={{ transitionDelay: '200ms' }}></span>
                                <span style={{ transitionDelay: '250ms' }}>ا</span>
                                <span style={{ transitionDelay: '300ms' }}>لـ</span>
                                <span style={{ transitionDelay: '350ms' }}>مـ</span>
                                <span style={{ transitionDelay: '400ms' }}>ر</span>
                                <span style={{ transitionDelay: '450ms' }}>و</span>
                                <span style={{ transitionDelay: '500ms' }}>ر</span>
                            </label>
                        </div>
                        <span className="toggle-password" onClick={togglePasswordVisibility}>
                            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? <div className="spinner"></div> : "تسجيل الدخول"}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                    <p className="switch-mode" onClick={() => setIsRegistering(true)}><span style={{ color: "gray" }}>ليس لديك حساب؟</span> سجل الآن</p>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="register-form">
                    <h1 className="register-title">التسجيل</h1>
                    <div className="form-control2">
                        <input
                            type="text"
                            required
                            value={registerData.name}
                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        />
                        <label>
                            <span style={{ transitionDelay: '0ms' }}>ا</span>
                            <span style={{ transitionDelay: '50ms' }}>لـ</span>
                            <span style={{ transitionDelay: '100ms' }}>ا</span>
                            <span style={{ transitionDelay: '150ms' }}>سـ</span>
                            <span style={{ transitionDelay: '200ms' }}>م</span>
                            <span style={{ transitionDelay: '250ms' }}></span>
                            <span style={{ transitionDelay: '300ms' }}>ا</span>
                            <span style={{ transitionDelay: '350ms' }}>لـ</span>
                            <span style={{ transitionDelay: '400ms' }}>كـ</span>
                            <span style={{ transitionDelay: '450ms' }}>ا</span>
                            <span style={{ transitionDelay: '500ms' }}>مـ</span>
                            <span style={{ transitionDelay: '550ms' }}>ل</span>
                        </label>
                    </div>
                    <div className="form-control2">
                        <input
                            type="text"
                            required
                            value={registerData.identifier}
                            onChange={(e) => setRegisterData({ ...registerData, identifier: e.target.value.replace(/\s/g, "") })}
                        />
                        <label>
                            <span style={{ transitionDelay: '0ms' }}>ا</span>
                            <span style={{ transitionDelay: '50ms' }}>سـ</span>
                            <span style={{ transitionDelay: '100ms' }}>م</span>
                            <span style={{ transitionDelay: '150ms' }}></span>
                            <span style={{ transitionDelay: '200ms' }}>ا</span>
                            <span style={{ transitionDelay: '250ms' }}>لـ</span>
                            <span style={{ transitionDelay: '300ms' }}>مـ</span>
                            <span style={{ transitionDelay: '350ms' }}>سـ</span>
                            <span style={{ transitionDelay: '400ms' }}>تـ</span>
                            <span style={{ transitionDelay: '450ms' }}>خـ</span>
                            <span style={{ transitionDelay: '500ms' }}>د</span>
                            <span style={{ transitionDelay: '550ms' }}>م</span>
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
                                <span style={{ transitionDelay: '0ms' }}>كـ</span>
                                <span style={{ transitionDelay: '50ms' }}>لـ</span>
                                <span style={{ transitionDelay: '100ms' }}>مـ</span>
                                <span style={{ transitionDelay: '150ms' }}>ة</span>
                                <span style={{ transitionDelay: '200ms' }}></span>
                                <span style={{ transitionDelay: '250ms' }}>ا</span>
                                <span style={{ transitionDelay: '300ms' }}>لـ</span>
                                <span style={{ transitionDelay: '350ms' }}>مـ</span>
                                <span style={{ transitionDelay: '400ms' }}>ر</span>
                                <span style={{ transitionDelay: '450ms' }}>و</span>
                                <span style={{ transitionDelay: '500ms' }}>ر</span>
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
                            <span style={{ transitionDelay: '0ms' }}>ا</span>
                            <span style={{ transitionDelay: '50ms' }}>لـ</span>
                            <span style={{ transitionDelay: '100ms' }}>بـ</span>
                            <span style={{ transitionDelay: '150ms' }}>ر</span>
                            <span style={{ transitionDelay: '200ms' }}>يـ</span>
                            <span style={{ transitionDelay: '250ms' }}>د</span>
                            <span style={{ transitionDelay: '300ms' }}></span>
                            <span style={{ transitionDelay: '350ms' }}>ا</span>
                            <span style={{ transitionDelay: '400ms' }}>لـ</span>
                            <span style={{ transitionDelay: '450ms' }}>ا</span>
                            <span style={{ transitionDelay: '500ms' }}>لـ</span>
                            <span style={{ transitionDelay: '550ms' }}>كـ</span>
                            <span style={{ transitionDelay: '600ms' }}>تـ</span>
                            <span style={{ transitionDelay: '650ms' }}>ر</span>
                            <span style={{ transitionDelay: '700ms' }}>و</span>
                            <span style={{ transitionDelay: '750ms' }}>نـ</span>
                            <span style={{ transitionDelay: '800ms' }}>ـي</span>
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
                            <span style={{ transitionDelay: '0ms' }}>ر</span>
                            <span style={{ transitionDelay: '50ms' }}>قـ</span>
                            <span style={{ transitionDelay: '100ms' }}>م</span>
                            <span style={{ transitionDelay: '150ms' }}></span>
                            <span style={{ transitionDelay: '200ms' }}>ا</span>
                            <span style={{ transitionDelay: '250ms' }}>لـ</span>
                            <span style={{ transitionDelay: '300ms' }}>ه</span>
                            <span style={{ transitionDelay: '350ms' }}>ا</span>
                            <span style={{ transitionDelay: '400ms' }}>تـ</span>
                            <span style={{ transitionDelay: '450ms' }}>ف</span>
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
                            <span style={{ transitionDelay: '0ms' }}>كـ</span>
                            <span style={{ transitionDelay: '50ms' }}>و</span>
                            <span style={{ transitionDelay: '100ms' }}>د</span>
                            <span style={{ transitionDelay: '150ms' }}></span>
                            <span style={{ transitionDelay: '200ms' }}>ا</span>
                            <span style={{ transitionDelay: '250ms' }}>لـ</span>
                            <span style={{ transitionDelay: '300ms' }}>د</span>
                            <span style={{ transitionDelay: '350ms' }}>عـ</span>
                            <span style={{ transitionDelay: '400ms' }}>و</span>
                            <span style={{ transitionDelay: '450ms' }}>ة</span>
                        </label>
                    </div>
                    <button type="submit" className="register-button" disabled={loading}>
                        {loading ? <div className="spinner"></div> : "التسجيل"}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                    <p className="switch-mode" onClick={() => setIsRegistering(false)}><span style={{ color: "gray" }}>هل لديك حساب بالفعل؟</span> تسجيل الدخول</p>
                </form>
            )}
    
            <button style={{ backgroundColor: "#5700B430", color: "white", border: "1px solid rgb(80, 6, 217)", fontSize: "22px", width: "100%" }} onClick={() => navigate("/documentation")}>المستند</button>
    
            <p style={{ color: 'gray' }}>اطلع على <span  onClick={() => navigate("/privacy-policy")} className="switch-mode">سياسة الخصوصية</span> أو <span onClick={() => navigate("/terms-and-conditions")} className="switch-mode">شروط الاستخدام</span></p>
    
            {showPopup && (
                <div className="popup">
                    <h3 style={{ color: "green" }}>تم التسجيل بنجاح!</h3>
                    <p style={{ color: "black" }}>ID: {registerData.identifier}</p>
                    <p style={{ color: "black" }}>كلمة المرور: {registerData.password}</p>
                    <button onClick={() => setShowPopup(false)}>إغلاق</button>
                </div>
            )}
        </div>
    );
};

export default Login;