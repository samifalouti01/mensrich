import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabaseClient";
import { FaCopy, FaArrowUp, FaEdit, FaTrash } from "react-icons/fa";  
import "./ManagePosts.css";

const ManagePosts = () => {
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem("searchQuery") || "";
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem("selectedCategory") || "Tous";
  });
  const [products, setProducts] = useState([]); 
  const [isScrollVisible, setIsScrollVisible] = useState(false); 
  const [loading, setLoading] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); 
  const [editingProduct, setEditingProduct] = useState(null); 

  const searchRef = useRef(null);

  const fetchStoreData = async () => {
    setLoading(true); 
    const { data, error } = await supabase
      .from("store")
      .select("id, product_image, title, ref, price, sex");

    setLoading(false); 
    if (error) {
      console.error("Error fetching data:", error);
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
    localStorage.setItem("searchQuery", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem("selectedCategory", selectedCategory);
  }, [selectedCategory]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Failed to copy text:", err);
    });
  };

  const handleSearch = () => {
    setSearchQuery(searchRef.current.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery("");  
    if (searchRef.current) {
      searchRef.current.value = ""; 
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsEditing(true);  
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("store")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
    } else {
      setProducts(products.filter((product) => product.id !== id)); 
    }
  };

  const handleSaveEdit = async () => {
    const { id, title, price, sex, ref } = editingProduct;

    const { error } = await supabase
      .from("store")
      .update({ title, price, sex, ref })
      .eq("id", id);

    if (error) {
      console.error("Error updating product:", error);
    } else {
      setProducts(products.map((product) => (product.id === id ? editingProduct : product)));
      setIsEditing(false);
      setEditingProduct(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prev) => ({ ...prev, [name]: value }));
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "Tous" || product.sex.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = product.ref
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="shop-container">
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
      </div>

      <div className="recommended">
        <h2>{selectedCategory}</h2>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="product-list">
            {filteredProducts.length === 0 ? (
              <p>No products found</p>
            ) : (
              filteredProducts.map((product) => (
                <div className="product-item" key={product.id}>
                  <div className="product-left">
                    <img src={product.product_image} alt={product.title} />
                    <div className="title-info">
                      <h3>{product.title}</h3>
                      <div className="ref-info">
                        <p>Réf : {product.ref}</p>
                        <FaCopy
                          className="copy-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(product.ref);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="product-right">
                    <div className="price-info">
                      <div className="price">
                        <img src="Coin.svg" alt="currency" />
                        <p>{product.price} FC</p>
                      </div>
                      <h3>{(product.price * 100).toLocaleString()} DZD</h3>
                    </div>
                  </div>
                  <div className="actions">
                      <FaEdit style={{ fontSize: "30px"}} className="edit-icon" onClick={() => handleEdit(product)} />
                      <FaTrash style={{ fontSize: "30px"}} className="delete-icon" onClick={() => handleDelete(product.id)} />
                    </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Product</h3>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={editingProduct.title}
              onChange={handleInputChange}
            />
            <label>Ref:</label>
            <input
              type="text"
              name="ref"
              value={editingProduct.ref}
              onChange={handleInputChange}
            />
            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={editingProduct.price}
              onChange={handleInputChange}
            />
            <label>Category (sex):</label>
            <select
              name="sex"
              value={editingProduct.sex}
              onChange={handleInputChange}
            >
              <option value="hommes">Hommes</option>
              <option value="femmes">Femmes</option>
            </select>
            <button onClick={handleSaveEdit}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isScrollVisible && (
        <button className="scroll-to-top" onClick={handleScrollToTop}>
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default ManagePosts;
