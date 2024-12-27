import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cart from "../components/Cart";
import "./Boutique.css";

const Boutique = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // toggle cart visibility
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("store")
        .select("id, product_image, title, description, price");

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    setCartItems((prevItems) => [...prevItems, product]);
  };

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

  const handleRemoveItem = (index) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
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
              X
            </button>
          )}
        </div>
        <div className="cart-icon" onClick={() => setIsCartOpen(!isCartOpen)}>
          <FaShoppingCart />
          {cartItems.length > 0 && (
            <span className="cart-count">{cartItems.length}</span>
          )}
        </div>
      </header>

      {/* Cart embedded in the page */}
      {isCartOpen && (
        <div className="cart-page">
          <Cart
            cartItems={cartItems}
            onRemoveItem={handleRemoveItem}
            onClose={() => setIsCartOpen(false)}
          />
        </div>
      )}

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
            />
            <h3 className="product-title">{product.title}</h3>
            <p className="product-points">{product.price} points</p>
            <p className="product-price">
              {(product.price * 100).toLocaleString()} DA
            </p>
            <p className="product-description">{product.description}</p>
            <button
              className="add-to-cart-button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Boutique;
