import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/router";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle for forgot password form
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
      router.push("/");
    } catch (error) {
      // Handle email not verified error
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
      setIsForgotPassword(false); // Hide the forgot password form after success
    } catch (error) {
      setErrorMessage("خطا در تغییر رمز عبور.");
      setSuccessMessage("");
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">ورود</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Login Form */}
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
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            ورود
          </Button>
          <Button
            variant="link"
            onClick={() => setIsForgotPassword(true)}
            className="mt-2"
          >
            فراموشی رمز عبور؟
          </Button>
        </Form>
      ) : (
        // Forgot Password Form
        <Form onSubmit={handleForgotPassword}>
          <Form.Group className="mb-3">
            <Form.Label>کد ملی</Form.Label>
            <Form.Control
              type="text"
              name="national_id"
              placeholder="کد ملی"
              value={formData.national_id}
              onChange={handleChange}
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
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            تغییر رمز عبور
          </Button>
          <Button
            variant="link"
            onClick={() => setIsForgotPassword(false)}
            className="mt-2"
          >
            بازگشت به ورود
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default LoginPage;
