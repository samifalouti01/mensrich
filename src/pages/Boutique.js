import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useLevel } from "../components/LevelContext";
import { Search, X } from "lucide-react";
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();

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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

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
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-button"
                onClick={() => setSearchQuery("")}
              >
                <X className="clear-icon" />
              </button>
            )}
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
                  <p className="product-points">{(product.price - 6).toLocaleString()} {t("points")}</p>
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