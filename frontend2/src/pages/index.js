import React, { useState, useEffect } from "react";
import axios from "axios";
import RegistrationPage from "../../components/RegistrationPage";
import LoginPage from "../../components/LoginPage";
import ProfilePage from "../../components/ProfilePage";
import SupplierPanel from "../../components/SupplierPanel";
import CustomerPanel from "../../components/CustomerPanel";
import AdminLogin from "../../components/AdminLogin";
import AdminPage from "../../components/AdminPage";
import { Container } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState("register");
  const [user, setUser] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // ✅ Read user and admin login state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setActiveTab("profile");
      }

      const adminLoginStatus = localStorage.getItem("isAdminLoggedIn");
      if (adminLoginStatus === "true") {
        setIsAdminLoggedIn(true);
        setActiveTab("adminPage");
      }
    }
  }, []);

  // ✅ Fetch user role if missing
  useEffect(() => {
    async function fetchUserProfile() {
      if (user && !user.role) {
        try {
          const response = await axios.get("http://localhost:8000/api/user/profile/", {
            headers: { Authorization: `Token ${user.token}` },
          });
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

  // ✅ User navigation
  let tabs = [];
  if (isAdminLoggedIn) {
    tabs = [{key: "admin", label: "پنل مدیریت", component: <AdminPage setActiveTab={setActiveTab}/>}]
  } else if (!user) {
    tabs = [
      { key: "register", label: "ثبت‌نام", component: <RegistrationPage /> },
      { key: "login", label: "ورود", component: <LoginPage /> },
      { key: "adminLogin", label: "ورود مدیریت", component: <AdminLogin setIsAdminLoggedIn={setIsAdminLoggedIn} setActiveTab={setActiveTab} /> },
    ];
  } else if (user.role === "supplier") {
    tabs = [
      { key: "profile", label: "پروفایل", component: <ProfilePage /> },
      { key: "supplierPanel", label: "پنل تأمین‌کننده", component: <SupplierPanel /> },
    ];
  } else if (user.role === "customer") {
    tabs = [
      { key: "profile", label: "پروفایل", component: <ProfilePage /> },
      { key: "customerPanel", label: "محصولات", component: <CustomerPanel /> },
    ];
  }

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
      <Container style={{ padding: "20px" }}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={tabStyle(activeTab === tab.key)}>
            {tab.label}
          </button>
        ))}
        <div>{tabs.find((tab) => tab.key === activeTab)?.component}</div>
      </Container>
    </div>
  );
};

const tabStyle = (isActive) => ({
  padding: "10px 20px",
  backgroundColor: isActive ? "#007bff" : "#fff",
  color: isActive ? "#fff" : "#007bff",
  border: "2px solid #007bff",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
});

export default Home;
