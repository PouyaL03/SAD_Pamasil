import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    mobile_number: "",
    national_id: "",
    email: "",
    username: "",
    password: "",
    password2: "", // Added field for repeat password
    role: "customer", // Default role is "customer"
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    if (formData.password !== formData.password2) {
      setErrorMessage("رمز عبور و تکرار رمز عبور باید یکسان باشند.");
      setSuccessMessage("");
      return;
    }
    try {
      await axios.post("http://localhost:8000/api/user/register/", formData);
      setSuccessMessage("ثبت‌نام با موفقیت انجام شد. لطفا ایمیل خود را برای تایید حساب بررسی کنید.");
      setErrorMessage("");
      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        mobile_number: "",
        national_id: "",
        email: "",
        username: "",
        password: "",
        password2: "", // Reset password fields
        role: "customer", // Reset to default role after registration
      });
    } catch (error) {
      if (error.response && error.response.data) {
        let backendErrors = Object.values(error.response.data)
          .flat()
          .join(" ");
        backendErrors = backendErrors
          .replaceAll("user with this", "کاربری با این")
          .replaceAll("A user with that username", "کاربری با این نام کاربری")
          .replaceAll("already exists.", "وجود دارد. </br>");
        setErrorMessage(backendErrors);
      } else {
        setErrorMessage("خطا در ثبت‌نام، لطفاً دوباره تلاش کنید. </br>");
      }
      setSuccessMessage("");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "600px", direction: "rtl" }}>
      <h2 className="text-center mb-4" style={{ fontWeight: "bold" }}>ثبت‌نام</h2>
      {errorMessage && (
        <Alert variant="danger">
          <div dangerouslySetInnerHTML={{ __html: errorMessage }} />
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
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>ایمیل</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="ایمیل"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
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
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>رمز عبور</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="رمز عبور"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>تکرار رمز عبور</Form.Label>
          <Form.Control
            type="password"
            name="password2"
            placeholder="تکرار رمز عبور"
            value={formData.password2}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
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
        </Form.Group>
        <Button variant="primary" type="submit" style={{ width: "100%" }}>
          ثبت‌نام
        </Button>
      </Form>
    </Container>
  );
};

export default RegistrationPage;
