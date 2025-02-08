import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";

const RegistrationPage = () => {
  const initialFormData = {
    first_name: "",
    last_name: "",
    date_of_birth: "",
    mobile_number: "",
    national_id: "",
    email: "",
    username: "",
    password: "",
    password2: "", // Field for repeat password
    role: "customer", // Default role is "customer"
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({}); // For field-level errors
  const [successMessage, setSuccessMessage] = useState("");

  // States to control password visibility for each password field
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  // Helper function to render error messages even if they are not arrays.
  const renderError = (error) => {
    return Array.isArray(error) ? error.join(" ") : error;
  };

  // Function to convert Persian/Arabic numbers to English
  const convertToEnglishNumbers = (input) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    return input
      .split("")
      .map((char) => {
        if (persianNumbers.includes(char)) {
          return englishNumbers[persianNumbers.indexOf(char)];
        } else if (arabicNumbers.includes(char)) {
          return englishNumbers[arabicNumbers.indexOf(char)];
        }
        return char;
      })
      .join("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    // Convert to English numbers for specific fields
    if (name === "mobile_number" || name === "national_id") {
      processedValue = convertToEnglishNumbers(value);
    }
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    let localErrors = {};

    // Check if password and its repeat match; record error if they don't.
    if (formData.password !== formData.password2) {
      localErrors.password2 = ["رمز عبور و تکرار رمز عبور باید یکسان باشند."];
    }
    try {
      await axios.post("http://localhost:8000/api/user/register/", formData);
      setSuccessMessage(
        "ثبت‌نام با موفقیت انجام شد. لطفا ایمیل خود را برای تایید حساب بررسی کنید."
      );
      setErrors({});
      setFormData(initialFormData);
    } catch (error) {
      let backendErrors = {};
      if (error.response && error.response.data) {
        // Assume error.response.data is an object with field errors.
        backendErrors = error.response.data;
      } else {
        backendErrors = { global: ["خطا در ثبت‌نام، لطفاً دوباره تلاش کنید."] };
      }
      // Merge local errors with backend errors.
      setErrors({ ...backendErrors, ...localErrors });
      setSuccessMessage("");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "600px", direction: "rtl" }}>
      <h2 className="text-center mb-4" style={{ fontWeight: "bold" }}>
        ثبت‌نام
      </h2>
      {/* Optionally, show a global error if exists */}
      {errors.global && (
        <Alert variant="danger">
          {renderError(errors.global)}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success">
          <div dangerouslySetInnerHTML={{ __html: successMessage }} />
        </Alert>
      )}

      <Form onSubmit={handleRegister}>
        <Form.Group className="mb-3">
          <Form.Label>نام</Form.Label>
          <Form.Control
            type="text"
            name="first_name"
            placeholder="نام"
            value={formData.first_name}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
          {errors.first_name && (
            <Form.Text className="text-danger">
              {renderError(errors.first_name)}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>نام خانوادگی</Form.Label>
          <Form.Control
            type="text"
            name="last_name"
            placeholder="نام خانوادگی"
            value={formData.last_name}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
          {errors.last_name && (
            <Form.Text className="text-danger">
              {renderError(errors.last_name)}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>تاریخ تولد</Form.Label>
          <Form.Control
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
          {errors.date_of_birth && (
            <Form.Text className="text-danger">
              {renderError(errors.date_of_birth)}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>شماره موبایل</Form.Label>
          <Form.Control
            type="text"
            name="mobile_number"
            placeholder="شماره موبایل"
            value={formData.mobile_number}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
          {errors.mobile_number && (
            <Form.Text className="text-danger">
              {renderError(errors.mobile_number)}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>کد ملی</Form.Label>
          <Form.Control
            type="text"
            name="national_id"
            placeholder="کد ملی"
            value={formData.national_id}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
          {errors.national_id && (
            <Form.Text className="text-danger">
              {renderError(errors.national_id)}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>ایمیل</Form.Label>
          <Form.Control
            type="text"
            name="email"
            placeholder="ایمیل"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
          {errors.email && (
            <Form.Text className="text-danger">
              {renderError(errors.email)}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>نام کاربری</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="نام کاربری"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
          {errors.username && (
            <Form.Text className="text-danger">
              {renderError(errors.username)}
            </Form.Text>
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
              required
              style={{ textAlign: "right", flex: 1 }}
            />
            <Form.Check
              type="checkbox"
              onChange={() => setShowPassword(!showPassword)}
              style={{ marginLeft: "12px" }}
              title="نمایش رمز عبور"
            />
          </div>
          {errors.password && (
            <Form.Text className="text-danger">
              {renderError(errors.password)}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>تکرار رمز عبور</Form.Label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Form.Control
              type={showPassword2 ? "text" : "password"}
              name="password2"
              placeholder="تکرار رمز عبور"
              value={formData.password2}
              onChange={handleChange}
              required
              style={{ textAlign: "right", flex: 1 }}
            />
            <Form.Check
              type="checkbox"
              onChange={() => setShowPassword2(!showPassword2)}
              style={{ marginLeft: "12px" }}
              title="نمایش رمز عبور"
            />
          </div>
          {errors.password2 && (
            <Form.Text className="text-danger">
              {renderError(errors.password2)}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>نقش</Form.Label>
          <Form.Control
            as="select"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          >
            <option value="customer">مشتری</option>
            <option value="supplier">تامین کننده</option>
          </Form.Control>
          {errors.role && (
            <Form.Text className="text-danger">
              {renderError(errors.role)}
            </Form.Text>
          )}
        </Form.Group>
        <Button variant="primary" type="submit" style={{ width: "100%" }}>
          ثبت‌نام
        </Button>
      </Form>
    </Container>
  );
};

export default RegistrationPage;
