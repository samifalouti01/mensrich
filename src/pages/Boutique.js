import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import "./Boutique.css";

const Boutique = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("store")
          .select("id, product_image, title, description, price");

        if (error) {
          throw error;
        }

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
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => handleProductClick(product.id)}
          >
            <img
              src={product.product_image}
              alt={product.title}
              className="product-image"
              loading="lazy"
            />
            <h3 className="product-title">{product.title}</h3>
            <p className="product-points">{product.price} points</p>
            <p className="product-price">
              {(product.price * 100).toLocaleString()} DA
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Boutique;