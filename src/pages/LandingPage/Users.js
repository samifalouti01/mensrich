import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import "./LandingPage.css";

const Users = () => {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({ triggerOnce: true });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const end = 14342; // Set your static number
            const duration = 2000; // Animation duration in ms
            const increment = Math.ceil(end / (duration / 16)); 

            const counter = setInterval(() => {
                start += increment;
                if (start >= end) {
                    start = end;
                    clearInterval(counter);
                }
                setCount(start);
            }, 16);
        }
    }, [inView]);

    return (
        <div className="users" ref={ref}>
            <h1><i className="bi bi-people"></i> عدد المستخدمين حتى الآن</h1>
            <p className="counter">{count.toLocaleString()} مستخدم</p>
        </div>
    );
};

export default Users;
