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
  // Object to store error messages by field name.
  // For “global” errors that don’t belong to a particular field, you can use the key "global".
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  // For toggling password field visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Helper to translate common error messages into Persian.
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
    return message;
  };

  // Client–side validation for the forgot–password new password.
  const validateNewPassword = (value) => {
    if (value.length < 8) {
      return "رمز عبور باید حداقل 8 کاراکتر باشد.";
    }
    if (!/[A-Z]/.test(value)) {
      return "رمز عبور باید حداقل یک حرف بزرگ داشته باشد.";
    }
    if (!/\d/.test(value)) {
      return "رمز عبور باید حداقل یک عدد داشته باشد.";
    }
    if (!/[.*@#$%]/.test(value)) {
      return "رمز عبور باید حداقل یکی از کاراکترهای ویژه (.*, @, #, $, %) داشته باشد.";
    }
    return "";
  };

  // When a field changes, update formData and clear any previous error for that field.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handler for login.
  const handleLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSuccessMessage("");
    try {
      const response = await axios.post("http://localhost:8000/api/user/login/", {
        username: formData.username,
        password: formData.password,
      });
      localStorage.setItem("user", JSON.stringify(response.data));
      setSuccessMessage("ورود با موفقیت انجام شد.");
      // Optionally clear sensitive fields.
      setFormData((prev) => ({ ...prev, password: "" }));
      window.location.reload();
    } catch (error) {
      let errors = {};
      if (error.response && error.response.data) {
        const data = error.response.data;
        // If the backend returns a string, wrap it.
        if (typeof data === "string") {
          // In login mode, assign the error to the username field.
          errors.username = translateErrorMessage(data);
        } else if (typeof data === "object") {
          // If there is a top-level "error" key, assign it to the username field.
          // (You can change this to password or global if you prefer.)
          if (data.error) {
            errors.username = translateErrorMessage(data.error);
          }
          // Process any field-specific errors.
          Object.entries(data).forEach(([field, messages]) => {
            if (field === "error") return;
            const msgs = Array.isArray(messages) ? messages : [messages];
            errors[field] = msgs.map((msg) => translateErrorMessage(msg)).join(" ");
          });
        }
      } else {
        errors.global = "خطا در برقراری ارتباط با سرور.";
      }
      setFieldErrors(errors);
    }
  };

  // Handler for forgot password.
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSuccessMessage("");
    // Validate new password on the client side.
    const validationError = validateNewPassword(formData.new_password);
    if (validationError) {
      setFieldErrors({ new_password: validationError });
      return;
    }
    try {
      const response = await axios.post("http://localhost:8000/api/user/forgot-password/", {
        national_id: formData.national_id,
        new_password: formData.new_password,
      });
      setSuccessMessage(response.data.message || "رمز عبور با موفقیت تغییر کرد.");
      setFieldErrors({});
      setIsForgotPassword(false);
    } catch (error) {
      let errors = {};
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (typeof data === "string") {
          // In forgot-password mode, assign top-level errors to the national_id field.
          errors.national_id = translateErrorMessage(data);
        } else if (typeof data === "object") {
          if (data.error) {
            errors.national_id = translateErrorMessage(data.error);
          }
          Object.entries(data).forEach(([field, messages]) => {
            if (field === "error") return;
            const msgs = Array.isArray(messages) ? messages : [messages];
            errors[field] = msgs.map((msg) => translateErrorMessage(msg)).join(" ");
          });
        }
      } else {
        errors.global = "خطا در برقراری ارتباط با سرور.";
      }
      setFieldErrors(errors);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "500px", direction: "rtl" }}>
      <h2 className="text-center mb-4" style={{ fontWeight: "bold" }}>
        ورود
      </h2>
      {/* Display any global errors if present */}
      {fieldErrors.global && <Alert variant="danger">{fieldErrors.global}</Alert>}
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
            {/* If an error is assigned to "username", show it below the field */}
            {fieldErrors.username && (
              <Form.Text className="text-danger">{fieldErrors.username}</Form.Text>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>رمز عبور</Form.Label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="رمز عبور"
                value={formData.password}
                onChange={handleChange}
                style={{ textAlign: "right", flex: 1 }}
                required
              />
              <Form.Check
                type="checkbox"
                onChange={() => setShowPassword(!showPassword)}
                style={{ marginLeft: "12px" }}
                title="نمایش رمز عبور"
              />
            </div>
            {fieldErrors.password && (
              <Form.Text className="text-danger">{fieldErrors.password}</Form.Text>
            )}
          </Form.Group>
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="primary" type="submit" style={{ width: "100px" }}>
              ورود
            </Button>
            <Button
              variant="link"
              onClick={() => {
                setIsForgotPassword(true);
                setFieldErrors({});
                setSuccessMessage("");
              }}
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
            {/* Display national_id–related errors here */}
            {fieldErrors.national_id && (
              <Form.Text className="text-danger">{fieldErrors.national_id}</Form.Text>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>رمز عبور جدید</Form.Label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Form.Control
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                placeholder="رمز عبور جدید"
                value={formData.new_password}
                onChange={handleChange}
                style={{ textAlign: "right", flex: 1 }}
                required
              />
              <Form.Check
                type="checkbox"
                onChange={() => setShowNewPassword(!showNewPassword)}
                style={{ marginLeft: "12px" }}
                title="نمایش رمز عبور"
              />
            </div>
            {fieldErrors.new_password && (
              <Form.Text className="text-danger">{fieldErrors.new_password}</Form.Text>
            )}
          </Form.Group>
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="primary" type="submit" style={{ width: "150px" }}>
              تغییر رمز عبور
            </Button>
            <Button
              variant="link"
              onClick={() => {
                setIsForgotPassword(false);
                setFieldErrors({});
                setSuccessMessage("");
              }}
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
