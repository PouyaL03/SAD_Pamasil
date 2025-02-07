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

  // Helper function to translate common English error messages into Persian.
  const translateErrorMessage = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes("ensure this field has at least 8 characters")) {
      return "رمز عبور باید حداقل 8 کاراکتر باشد.";
    }
    if (msg.includes("this field may not be blank")) {
      return "این فیلد نمی‌تواند خالی باشد.";
    }
    if (msg.includes("invalid")) {
      return "مقدار وارد شده معتبر نیست.";
    }
    if (msg.includes("not found")) {
      return "یافت نشد.";
    }
    // You can add more mappings here as needed.
    return message;
  };

  // Handle changes for form fields.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for normal login.
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/user/login/", {
        username: formData.username,
        password: formData.password,
      });
      // Save the user data in localStorage.
      localStorage.setItem("user", JSON.stringify(response.data));
      setSuccessMessage("ورود با موفقیت انجام شد.");
      setErrorMessage("");
      // Reload the page so the Home component can pick up the logged-in user.
      window.location.reload();
    } catch (error) {
      let apiError = "";
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          apiError = error.response.data;
        } else if (typeof error.response.data === "object") {
          // Combine all error messages into a single string.
          apiError = Object.values(error.response.data).flat().join(" ");
        }
      } else {
        apiError = "خطا در برقراری ارتباط با سرور.";
      }
      setErrorMessage(translateErrorMessage(apiError));
      setSuccessMessage("");
    }
  };

  // Handler for forgot password.
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/user/forgot-password/", {
        national_id: formData.national_id,
        new_password: formData.new_password,
      });
      setSuccessMessage(response.data.message || "رمز عبور با موفقیت تغییر کرد.");
      setErrorMessage("");
      // After a successful password change, revert to the login form.
      setIsForgotPassword(false);
    } catch (error) {
      let apiError = "";
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          apiError = error.response.data;
        } else if (typeof error.response.data === "object") {
          apiError = Object.values(error.response.data).flat().join(" ");
        }
      } else {
        apiError = "خطا در برقراری ارتباط با سرور.";
      }
      setErrorMessage(translateErrorMessage(apiError));
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
              required
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
              required
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
              required
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
              required
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
