import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Alert } from "react-bootstrap";

const AdminLogin = ({ setIsAdminLoggedIn, setActiveTab }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/packages/admin/login/", { pin });

      if (response.data.token) {
        setIsAdminLoggedIn(true);
        localStorage.setItem("admin", JSON.stringify(response.data));
        setActiveTab("adminPage");
      } else {
        setError("ورود ناموفق بود، لطفاً دوباره امتحان کنید.");
      }
    } catch (error) {
      setError("⚠️ ورود مدیر ناموفق بود.");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "500px", direction: "rtl" }}>
      <h2 className="text-center mb-4">ورود به پنل مدیریت</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label>PIN مدیریت</Form.Label>
          <Form.Control
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit">ورود</Button>
      </Form>
    </Container>
  );
};

export default AdminLogin;
