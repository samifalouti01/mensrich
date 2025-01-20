import React, { useState, useEffect, useRef } from "react";
import { FaAlignLeft } from "react-icons/fa";
import { GB, FR, SA } from 'country-flag-icons/react/3x2';
import LeftNavBar from "./LeftNavBar";
import { useTranslation } from 'react-i18next';
import "./Header.css";

const Header = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState(() => {
        return localStorage.getItem('selectedLanguage') || 'en';
    });
    const navRef = useRef(null);
    const { i18n } = useTranslation();

    const languageOptions = [
        { code: 'en', flag: GB, label: 'English', type: 'component' },
        { code: 'fr', flag: FR, label: 'French', type: 'component' },
        { code: 'ar', flag: SA, label: 'Arabic', type: 'component' },
        { 
            code: 'ta', 
            flag: "berberflag.svg",
            label: 'Tamazight',
            type: 'image'
        }
    ];

    const toggleNav = () => {
        setIsNavOpen((prev) => !prev);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setSelectedLang(lng);
        localStorage.setItem('selectedLanguage', lng);
    };

    useEffect(() => {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage) {
            i18n.changeLanguage(savedLanguage);
            setSelectedLang(savedLanguage);
        }

        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsNavOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [i18n]);

    // Custom select component to show current flag
    const SelectedFlag = () => {
        const currentLang = languageOptions.find(lang => lang.code === selectedLang);
        
        if (currentLang.type === 'image') {
            return <img src={currentLang.flag} alt={currentLang.label} className="selected-flag" />;
        }
        
        const Flag = currentLang.flag;
        return <Flag className="selected-flag" />;
    };

    return (
        <>
            <header className="header">
                <FaAlignLeft className="menu-icon" onClick={toggleNav} />
                <img src="Mencedes.svg" alt="logo" />
                <div className="language-selector">
                    <div className="select-wrapper">
                        <SelectedFlag />
                        <select 
                            value={selectedLang}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="language-select"
                        >
                            {languageOptions.map(({ code, label }) => (
                                <option key={code} value={code}>
                                    {label}
                                </option>
                            ))}
                        </select>
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