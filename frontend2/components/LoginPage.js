import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/router";

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
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/user/login/", formData);
      localStorage.setItem("user", JSON.stringify(response.data));
      setSuccessMessage("ورود با موفقیت انجام شد.");
      setErrorMessage("");

      // Check if the user is a supplier
      if (response.data.role === "supplier") {
        router.push("/add-product"); // Redirect to add-product page
      } else {
        router.push("/"); // Redirect to homepage for non-suppliers
      }

    } catch (error) {
      if (error.response && error.response.data.error === "لطفا ایمیل خود را تایید کنید.") {
        setErrorMessage("لطفا ایمیل خود را تایید کنید.");
      } else {
        setErrorMessage("نام کاربری یا رمز عبور اشتباه است.");
      }
      setSuccessMessage("");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/user/forgot-password/", formData);
      setSuccessMessage(response.data.message);
      setErrorMessage("");
      setIsForgotPassword(false);
    } catch (error) {
      setErrorMessage("خطا در تغییر رمز عبور.");
      setSuccessMessage("");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "500px", direction: "rtl" }}>
      <h2 className="text-center mb-4" style={{ fontWeight: "bold" }}>ورود</h2>
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
            <Button
              variant="link"
              onClick={() => setIsForgotPassword(true)}
              style={{ textDecoration: "none", fontSize: "0.9rem" }}
            >
              فراموشی رمز عبور؟
            </Button>
          </div>
        </Form>
      ) : (
        <Form onSubmit={handleForgotPassword}>
          <Form.Group className="mb-3">
            <Form.Label>کد ملی</Form.Label>
            <Form.Control
              type="text"
              name="national_id"
              placeholder="کد ملی"
              value={formData.national_id}
              onChange={handleChange}
              style={{ textAlign: "right" }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>رمز عبور جدید</Form.Label>
            <Form.Control
              type="password"
              name="new_password"
              placeholder="رمز عبور جدید"
              value={formData.new_password}
              onChange={handleChange}
              style={{ textAlign: "right" }}
            />
          </Form.Group>
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="primary" type="submit" style={{ width: "150px" }}>
              تغییر رمز عبور
            </Button>
            <Button
              variant="link"
              onClick={() => setIsForgotPassword(false)}
              style={{ textDecoration: "none", fontSize: "0.9rem" }}
            >
              بازگشت به ورود
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default LoginPage;
