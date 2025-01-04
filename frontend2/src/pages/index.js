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
    <div
      style={{
        backgroundImage: "url('/images/watercolor-birthday-background-with-empty-space_52683-42227.jpg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "20px",
        direction: "rtl",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", gap: "10px" }}>
        {["products", "register", "login", "profile"].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              backgroundColor: activeTab === tab ? "#007bff" : "#fff",
              color: activeTab === tab ? "#fff" : "#007bff",
              border: "2px solid #007bff",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: activeTab === tab ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "none",
            }}
          >
            {tab === "products"
              ? "محصولات"
              : tab === "register"
              ? "ثبت‌نام"
              : tab === "login"
              ? "ورود"
              : "پروفایل"}
          </button>
        ))}
      </div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          background: "rgba(255, 255, 255, 0.8)",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default Home;
