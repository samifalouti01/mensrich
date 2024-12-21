import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaAlignLeft } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import LeftNavBar from "./LeftNavBar";
import "./Header.css";

const Header = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const navRef = useRef(null); 

    const toggleNav = () => {
        setIsNavOpen((prev) => !prev);
    };

    const handleLogout = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate("/");
        }, 2000);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsNavOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <header className="header">
                <FaAlignLeft className="menu-icon" onClick={toggleNav} />
                <img src="Mencedes.svg" alt="logo" />
                <button
                    className="logout-button"
                    onClick={handleLogout}
                    disabled={loading}
                >
                    {loading ? (
                        <div className="spinner"></div>
                    ) : (
                        <>
                            <FiLogOut style={{ marginRight: '-2px' }} className="logout-icon" />
                        </>
                    )}
                </button>
            </header>
            <div
                className={`left-navbar ${isNavOpen ? "" : "hidden"}`}
                ref={navRef}
            >
                <LeftNavBar />
            </div>
        </>
    );
};

export default Header;
