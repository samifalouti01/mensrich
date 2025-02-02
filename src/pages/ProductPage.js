import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ChevronLeft } from "lucide-react";
import OrderForm from "../components/OrderForm";
import { useLevel } from "../components/LevelContext";
import "./ProductPage.css";

const commissionRates = {
  Distributeur: 0.11,
  Animateur: 0.13,
  "Animateur Junior": 0.16,
  "Animateur Senior": 0.18,
  Manager: 0.20,
  "Manager Junior": 0.23,
  "Manager Senior": 0.25,
};

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { level } = useLevel();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("store")
          .select("id, title, description, price, product_image, product_status")
          .eq("id", productId)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
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

  const commissionRate = commissionRates[level] || commissionRates.Distributeur;
  const commission = product.price * commissionRate;

  return (
    <div className="product-page">
      <div className="product-container">
        <button
          className="back-button"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="back-icon" />
        </button>

        <div className="product-content">
          <div className="product-image-wrapper">
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
              <p className="product-points">
                {(product.price - 6).toLocaleString()} points
              </p>
              <p className="product-commission">
                Commission: {(commission * 100).toFixed(2)} DA
              </p>
              <div className={`product-statu ${product.product_status ? product.product_status.toLowerCase() : ''}`}>
                    {product.product_status || "Unknown"}
              </div>
            </div>

            <div className="product-description">
              <h2 className="description-title">Description</h2>
              <p className="description-text">{product.description}</p>
            </div>

            <div className="order-form-container">
              <OrderForm product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;