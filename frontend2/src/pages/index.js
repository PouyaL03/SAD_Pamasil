import React, { useState } from "react";
import ProductList from "../../components/ProductList";
import RegistrationPage from "../../components/RegistrationPage";
import LoginPage from "../../components/LoginPage";
import ProfilePage from "../../components/ProfilePage";

const Home = () => {
  const [activeTab, setActiveTab] = useState("products");

  const renderContent = () => {
    if (activeTab === "products") return <ProductList />;
    if (activeTab === "register") return <RegistrationPage />;
    if (activeTab === "login") return <LoginPage />;
    if (activeTab === "profile") return <ProfilePage />;
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("products")}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: activeTab === "products" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          محصولات
        </button>
        <button
          onClick={() => setActiveTab("register")}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: activeTab === "register" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ثبت‌نام
        </button>
        <button
          onClick={() => setActiveTab("login")}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: activeTab === "login" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ورود
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "profile" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          پروفایل
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default Home;
