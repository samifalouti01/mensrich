import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";
import { FaCopy, FaShoppingCart, FaArrowUp } from "react-icons/fa";  
import Cart from "../components/Cart";
import { useUser } from "../components/UserContext";
import "./Boutique.css";

const Boutique = () => {
  const [products, setProducts] = useState([]);
  const { level, calculateLevel } = useUser();
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem("searchQuery") || "";
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem("selectedCategory") || "Tous";
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isScrollVisible, setIsScrollVisible] = useState(false); 

  const searchRef = useRef(null);
  const cartRef = useRef(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchStoreData = async () => {
    const { data, error } = await supabase
      .from("store")
      .select("id, product_image, title, ref, price, sex");

    if (error) {
      console.error("Erreur lors de la récupération des données :", error);
    } else {
      setProducts(data);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrollVisible(true);
      } else {
        setIsScrollVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("searchQuery", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem("selectedCategory", selectedCategory);
  }, [selectedCategory]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Échec de la copie du texte :", err);
    });
  };

  const handleAddToCart = (product) => {
    setCartItems((prevCart) => [...prevCart, product]);
  };

  const handleSearch = () => {
    setSearchQuery(searchRef.current.value);
  };

  const handleClickOutside = (event) => {
    if (cartRef.current && !cartRef.current.contains(event.target)) {
      setIsCartOpen(false);
    }
  };

  useEffect(() => {
    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "Tous" || product.sex === selectedCategory.toLowerCase();
      const matchesSearch = product.ref.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery("");
    if (searchRef.current) {
      searchRef.current.value = "";
    }
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  const onRemoveItem = (index = null) => {
    if (index === null) {
      setCartItems([]); 
    } else {
      setCartItems(prevItems => prevItems.filter((_, i) => i !== index));
    }
  };

  const discountPercentages = {
    "Distributeur": 0.20,
    "Animateur Adjoint": 0.35, // 35%
    "Animateur": 0.38,         // 38%
    "Manager Adjoint": 0.40,   // 40%
    "Manager": 0.48,           // 48%
  };

  const discountMultiplier = discountPercentages[level] || 0; // Default to 0 (no discount) if level is not found

    // Calculate discounted prices for each item
  const discountedItems = cartItems.map((item) => ({
    ...item,
    discountedPrice: item.price * (1 - discountMultiplier), // Discounted price for FC
  }));

  // Calculate total FC (with discounts applied)
  const pointsFC = discountedItems.reduce((total, item) => total + item.discountedPrice, 0);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });

  return (
    <div className="boutique-container">
      <Header />
      <div className="toolbar">
        <div className="category-buttons">
          <button
            className={selectedCategory === "Tous" ? "active" : ""}
            onClick={() => handleCategoryChange("Tous")}
          >
            Tous
          </button>
          <button
            className={selectedCategory === "Hommes" ? "active" : ""}
            onClick={() => handleCategoryChange("Hommes")}
          >
            Hommes
          </button>
          <button
            className={selectedCategory === "Femmes" ? "active" : ""}
            onClick={() => handleCategoryChange("Femmes")}
          >
            Femmes
          </button>
        </div>
        <input
          ref={searchRef}
          type="text"
          placeholder={`Rechercher dans ${selectedCategory}...`}
          className="search-bar"
          onChange={handleSearch}
          defaultValue={searchQuery}
        />
        <div className="cart-icon" onClick={() => setIsCartOpen(!isCartOpen)}>
          <FaShoppingCart />
          {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
        </div>
      </div>
      {isCartOpen && (
        <div ref={cartRef}>
          <Cart
            cartItems={cartItems}
            onRemoveItem={onRemoveItem}
            onClose={handleCloseCart}
          />
        </div>
      )}
      <div className="recommended">
        <h2>{selectedCategory}</h2>
        <div className="sort-buttons">
          <button
            className={sortOrder === "asc" ? "active" : ""}
            onClick={() => setSortOrder("asc")}
          >
            Pas cher
          </button>
          <button
            className={sortOrder === "desc" ? "active" : ""}
            onClick={() => setSortOrder("desc")}
          >
            Cher
          </button>
        </div>
        <br />
        <br />
        <div className="product-grid">
          {sortedProducts.map((product) => (
            <div
              className="product-card"
              key={product.id}
              onClick={() => handleAddToCart(product)}
            >
              <div className="pr">
                <img src={product.product_image} alt={product.title} />
                <div className="title-container">
                  <h3>{product.title}</h3>
                  <div className="copy-container">
                    <p>Réf : {product.ref}</p>
                    <FaCopy
                      style={{ color: '#000', marginTop: '-20px', padding: '0' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(product.ref);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="price-container">
                <div className="price">
                  <img src="Coin.svg" alt="pièce" />
                  <p>{(product.price * (1 - discountMultiplier)).toFixed(2)} FC</p>
                </div>
                <h3>{(product.price * 100).toLocaleString()} DZD</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isScrollVisible && (
        <button className="scroll-to-top" onClick={handleScrollToTop}>
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default Boutique;
