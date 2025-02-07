import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductList from "../../components/ProductList";
import RegistrationPage from "../../components/RegistrationPage";
import LoginPage from "../../components/LoginPage";
import ProfilePage from "../../components/ProfilePage";
import SupplierPanel from "../../components/SupplierPanel"; // Import the SupplierPanel component

const Home = () => {
  // Default to "register" when not logged in.
  const [activeTab, setActiveTab] = useState("register");
  const [user, setUser] = useState(null);

  // On mount, read user data from localStorage.
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setActiveTab("profile");
    }
  }, []);

  // If a user exists but the role is missing, call the profile API to fetch it.
  useEffect(() => {
    async function fetchUserProfile() {
      if (user && !user.role) {
        const token = user.token;
        try {
          const response = await axios.get("http://localhost:8000/api/user/profile/", {
            headers: { Authorization: `Token ${token}` },
          });
          // Assume the response data includes a "role" field.
          const updatedUser = { ...user, role: response.data.role };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
    }
    fetchUserProfile();
  }, [user]);

  // Render the appropriate page based on activeTab and login status.
  const renderContent = () => {
    if (!user) {
      // When not logged in, show Registration or Login.
      return activeTab === "register" ? <RegistrationPage /> : <LoginPage />;
    }
    // When logged in: if activeTab is "products", show ProductList; if "supplierPanel", show SupplierPanel; otherwise, show ProfilePage.
    if (activeTab === "products") {
      return <ProductList />;
    } else if (activeTab === "supplierPanel") {
      return <SupplierPanel />;
    }
    return <ProfilePage />;
  };

  // Determine which navigation buttons to display.
  let navButtons = [];
  if (!user) {
    // Not logged in: show a toggle button (if on "register", show "login" and vice versa).
    navButtons = activeTab === "register" ? ["login"] : ["register"];
  } else if (user.role === "supplier") {
    // For suppliers, show "profile" and "supplierPanel" buttons.
    navButtons = ["profile", "supplierPanel"];
  } else if (user.role === "customer") {
    // For customers, show only "profile" and "products" buttons.
    navButtons = ["products", "profile"];
  }

  // Helper: Map internal tab names to Persian labels.
  const getButtonLabel = (tab) => {
    switch (tab) {
      case "register":
        return "ثبت‌نام";
      case "login":
        return "ورود";
      case "profile":
        return "پروفایل";
      case "products":
        return "محصولات";
      case "supplierPanel":
        return "پنل تامین کننده";
      default:
        return tab;
    }
  };

  return (
    <div
      style={{
        backgroundImage:
          "url('/images/watercolor-birthday-background-with-empty-space_52683-42227.jpg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "20px",
        direction: "rtl",
      }}
    >
      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        {navButtons.map((tab, idx) => (
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
            {getButtonLabel(tab)}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
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
