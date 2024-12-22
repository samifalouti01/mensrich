import React, { useState, useEffect, useRef } from "react";
import { FaAlignLeft, FaCoins } from "react-icons/fa";
import LeftNavBar from "./LeftNavBar";
import Pay from "./Pay";
import "./Header.css";

const Header = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navRef = useRef(null); 

    const toggleNav = () => {
        setIsNavOpen((prev) => !prev);
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
                <div>
                <div className="pay-container">
                  <FaCoins className="pay-icon" />
                  <Pay />
                </div>
                </div>
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
