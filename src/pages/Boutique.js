import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useLevel } from "../components/LevelContext";
import "./Boutique.css";

const commissionRates = {
  Distributeur: 0.11,
  Animateur: 0.13,
  "Animateur Junior": 0.16,
  "Animateur Senior": 0.18,
  Manager: 0.20,
  "Manager Junior": 0.23,
  "Manager Senior": 0.25,
};

const Boutique = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { level } = useLevel();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("store")
          .select("id, product_image, title, description, price");

        if (error) throw error;
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const LoadingSkeleton = () => {
    return (
      <div className="skeleton-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-title" />
              <div className="skeleton-text" />
              <div className="skeleton-text" />
              <div className="skeleton-text" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleProductClick = (productId) => {
    navigate(`/productpage/${productId}`);
  };

  return (
    <div className="boutique">
      <Header />
      
      <div className="boutique-container">
        <div className="search-wrapper">
        <div>
            <div className="search-grid"></div>
              <div id="poda">
                <div className="glow"></div>
                <div className="darkBorderBg"></div>
                <div className="darkBorderBg"></div>
                <div className="darkBorderBg"></div>

                <div className="white"></div>

                <div className="border"></div>

                <div id="main">
                  <input
                    placeholder="Search..."
                    type="text"
                    name="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input"
                  />
                  <div id="input-mask"></div>
                  <div id="pink-mask"></div>
                  <div className="filterBorder"></div>
                  <div id="filter-icon">
                    <svg
                      preserveAspectRatio="none"
                      height="27"
                      width="27"
                      viewBox="4.8 4.56 14.832 15.408"
                      fill="none"
                      onClick={() => setSearchQuery("")}
                    >
                      <path
                          d="M6 6L18 18M18 6L6 18"
                          stroke="#56606e"
                          stroke-width="2"
                          stroke-miterlimit="10"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <div id="search-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      height="24"
                      fill="none"
                      className="feather feather-search"
                    >
                      <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
                      <line
                        stroke="url(#searchl)"
                        y2="16.65"
                        y1="22"
                        x2="16.65"
                        x1="22"
                      ></line>
                      <defs>
                        <linearGradient gradientTransform="rotate(50)" id="search">
                          <stop stopColor="#f8e7f8" offset="0%"></stop>
                          <stop stopColor="#b6a9b7" offset="50%"></stop>
                        </linearGradient>
                        <linearGradient id="searchl">
                          <stop stopColor="#b6a9b7" offset="0%"></stop>
                          <stop stopColor="#837484" offset="50%"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
          </div>
        </div>

        {isLoading ? (
        <LoadingSkeleton />
      ) : filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const commissionRate = commissionRates[level] || commissionRates.Distributeur;
            const commission = product.price * commissionRate;

            return (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="product-image-container">
                  <img
                    src={product.product_image}
                    alt={product.title}
                    className="product-image"
                    loading="lazy"
                  />
                </div>
                <div className="product-details">
                  <h3 className="product-title2">{product.title}</h3>
                  <p className="product-points">{(product.price - 6).toLocaleString()} points</p>
                  <p className="product-price">
                    {(product.price * 100).toLocaleString()} DA
                  </p>
                  <p className="product-commission">
                    {(commission * 100).toFixed(2)} DA
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="empty-state">
            <h3 style={{ color: "#5700B4" }}>No products found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Boutique;