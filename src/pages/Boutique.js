import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext";
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
  const { level } = useUser(); // Get level from UserContext

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
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductClick = (productId) => {
    navigate(`/productpage/${productId}`);
  };

  return (
    <div className="boutique">
      <Header />
      <header className="boutique-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-bar"
          />
          {searchQuery && (
            <button className="clear-search" onClick={handleClearSearch}>
              ×
            </button>
          )}
        </div>
      </header>

      <div className="product-grid">
        {filteredProducts.map((product) => {
          const commissionRate = commissionRates[level] || commissionRates.Distributeur;
          const commission = product.price * commissionRate;

          return (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleProductClick(product.id)}
            >
              <img
                src={product.product_image}
                alt={product.title}
                className="product-image-store"
                loading="lazy"
              />
              <h3 className="product-title">{product.title}</h3>
              <p className="product-points">{product.price} points</p>
              <p className="product-price">
                {(product.price * 100).toLocaleString() + " DA"}
              </p>
              <p className="product-commission">
                Commission: {(commission * 100).toFixed(2)} DA
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Boutique;