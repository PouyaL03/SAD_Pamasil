import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductListSupplier from "./ProductListSupplier";  // Component to show the supplier's own products
import AddProductPage from "./AddProductPage";  // Form to add new products

const SupplierPanel = () => {
  const [activeTab, setActiveTab] = useState("productList");
  const [user, setUser] = useState(null);

  // Fetch logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Render the correct content based on the active tab
  const renderContent = () => {
    if (activeTab === "productList") {
      return <ProductListSupplier />;
    } else if (activeTab === "addProduct") {
      return <AddProductPage />;
    }
  };

  // Helper function to map tab names to Persian labels
  const getTabLabel = (tab) => {
    switch (tab) {
      case "productList":
        return "محصولات من";
      case "addProduct":
        return "اضافه کردن محصول";
      default:
        return tab;
    }
  };

  return (
    <div>
      <h2>پنل تامین کننده</h2>
      
      {/* Navigation Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("productList")}
          style={{ padding: "10px", margin: "5px" }}
        >
          {getTabLabel("productList")}
        </button>
        <button
          onClick={() => setActiveTab("addProduct")}
          style={{ padding: "10px", margin: "5px" }}
        >
          {getTabLabel("addProduct")}
        </button>
      </div>

      {/* Content based on active tab */}
      <div>{renderContent()}</div>
    </div>
  );
};

export default SupplierPanel;
