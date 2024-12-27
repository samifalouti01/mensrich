import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import "./ProductPage.css";

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("store")
        .select("id, title, description, price, product_image")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);
      }
    };

    fetchProduct();
  }, [productId]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-page">
      <Header />
      <div className="product-main-image-container">
        <img
          src={product.product_image}
          alt={product.title}
          className="product-main-image"
        />
      </div>
      <h1 className="product-title">{product.title}</h1>
      <p className="product-price">{product.price} points</p>
      <p className="product-price-da">
        {(product.price * 100).toLocaleString()} DA
      </p>
      <p className="product-description">{product.description}</p>
    </div>
  );
};

export default ProductPage;
