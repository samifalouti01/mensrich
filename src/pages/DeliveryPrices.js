import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import { Search } from "lucide-react";
import "./DeliveryPrices.css";

const DeliveryPrices = () => {
  const [prices, setPrices] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    const { data, error } = await supabase
      .from("delivery_prices")
      .select("wilaya, price_home, price_desk");

    if (error) {
      console.error("Error fetching prices:", error);
    } else {
      setPrices(data);
    }
  };

  const filteredPrices = prices.filter((item) =>
    item.wilaya.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="delivery-prices-page">
      <Header />
      
      <div className="prices-container">
        <div className="prices-card">
          <h2 className="prices-title">أسعار التوصيل</h2>
          
          <div className="search-container">
            <div className="search-icon">
              <Search className="search-svg" />
            </div>
            <input
              type="text"
              placeholder="البحث حسب الولاية..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="table-wrapper">
            <table className="prices-table">
              <thead>
                <tr>
                  <th>الولاية</th>
                  <th>التوصيل إلى المنزل</th>
                  <th>استلام من المكتب</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.length > 0 ? (
                  filteredPrices.map((item, index) => (
                    <tr key={index} className="price-row">
                      <td className="wilaya-cell">{item.wilaya}</td>
                      <td className="price-cell">
                        <span className="home-price">{item.price_home}</span> DZD
                      </td>
                      <td className="price-cell">
                        <span className="desk-price">{item.price_desk}</span> DZD
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-results">
                      <div className="no-results-content">
                        <svg className="no-results-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="no-results-title">لم يتم العثور على ولايات مطابقة</p>
                        <p className="no-results-subtitle">جرب مصطلح بحث مختلف</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="prices-footer">
          *الأسعار بالدينار الجزائري (DZD)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPrices;