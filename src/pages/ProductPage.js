import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaChevronLeft } from "react-icons/fa";
import OrderForm from "../components/OrderForm"; 
import "./ProductPage.css";

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("store")
          .select("id, title, description, price, product_image")
          .eq("id", productId)
          .single();

        if (error) {
          throw error;
        }

        setProduct(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error loading product. Please try again later.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p className="error-message">Product not found.</p>
      </div>
    );
  }

  return (
    <div>
      <FaChevronLeft className="back-icon" onClick={() => window.history.back()} />
      <div className="product-page">
        <div className="product-main-image-container">
          <img
            src={product.product_image}
            alt={product.title}
            className="product-main-image"
            loading="lazy"
          />
        </div>
        <div className="product-info">
          <h1 className="product-title">{product.title}</h1>
          <div className="product-pricing">
            <p className="product-price">
              {(product.price * 100).toLocaleString()} DA
            </p>
            <p className="product-price-da">{product.price} points</p>
          </div>
          <p className="product-description">{product.description}</p>
        </div>
      </div>
      <div className="product-form">
        <OrderForm product={product} />
      </div>
    </div>
  );
};

export default ProductPage;
