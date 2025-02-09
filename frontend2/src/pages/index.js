import React, { useState, useEffect } from "react";
import axios from "axios";
import RegistrationPage from "../../components/RegistrationPage";
import LoginPage from "../../components/LoginPage";
import ProfilePage from "../../components/ProfilePage";
import SupplierPanel from "../../components/SupplierPanel";
import CustomerPanel from "../../components/CustomerPanel";
import { Tabs, Tab, Container } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';


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

  // Build an array of tab objects based on login status and role.
  let tabs = [];
  if (!user) {
    // When not logged in, show Registration and Login tabs.
    tabs = [
      { key: "register", label: "ثبت‌نام", component: <RegistrationPage /> },
      { key: "login", label: "ورود", component: <LoginPage /> },
    ];
  } else if (user.role === "supplier") {
    // For suppliers, show Profile and Supplier Panel tabs.
    tabs = [
      { key: "profile", label: "پروفایل", component: <ProfilePage /> },
      { key: "supplierPanel", label: "پنل تأمین‌کننده", component: <SupplierPanel /> },
    ];
  } else if (user.role === "customer") {
    // For customers, show Profile and Customer Panel tabs.
    tabs = [
      { key: "profile", label: "پروفایل", component: <ProfilePage /> },
      { key: "customerPanel", label: "محصولات", component: <CustomerPanel /> },
    ];
  }

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
      <Container style={{ padding: "20px" }}>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
          variant="pills"
        >
          {tabs.map((tab) => (
            <Tab eventKey={tab.key} title={tab.label} key={tab.key}>
              {tab.component}
            </Tab>
          ))}
        </Tabs>
      </Container>
    </div>
  );
};

export default Home;
