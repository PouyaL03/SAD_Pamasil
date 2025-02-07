import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    national_id: "",
    new_password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/user/login/", formData);
      // Save the user data (even if it doesn't include role) to localStorage.
      localStorage.setItem("user", JSON.stringify(response.data));
      setSuccessMessage("ورود با موفقیت انجام شد.");
      setErrorMessage("");
      // Force a full reload so Home re-reads localStorage and (if needed) fetches the role.
      window.location.reload();
    } catch (error) {
      if (
        error.response &&
        error.response.data.error === "لطفا ایمیل خود را تایید کنید."
      ) {
        setErrorMessage("لطفا ایمیل خود را تایید کنید.");
      } else {
        setErrorMessage("نام کاربری یا رمز عبور اشتباه است.");
      }
      setSuccessMessage("");
    }
  };

  return (
    <Container style={{ maxWidth: "500px", direction: "rtl" }}>
      <h2 className="text-center mb-4" style={{ fontWeight: "bold" }}>
        ورود
      </h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {!isForgotPassword ? (
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>نام کاربری</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="نام کاربری"
              value={formData.username}
              onChange={handleChange}
              style={{ textAlign: "right" }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>رمز عبور</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="رمز عبور"
              value={formData.password}
              onChange={handleChange}
              style={{ textAlign: "right" }}
            />
          </Form.Group>
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="primary" type="submit" style={{ width: "100px" }}>
              ورود
            </Button>
          </div>
        </Form>
      ) : (
        // (Optional) Forgot password form can be added here.
        <div></div>
      )}
    </Container>
  );
};

export default LoginPage;
