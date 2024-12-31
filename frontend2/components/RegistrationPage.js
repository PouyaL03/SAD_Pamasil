import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Alert, Row, Col, Card, Nav } from "react-bootstrap";

const RegistrationLoginPage = () => {
  const [activeTab, setActiveTab] = useState("register"); // To toggle between Register and Login
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    mobile_number: "",
    national_id: "",
    email: "",
    username: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const convertToEnglishNumbers = (input) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    return input.replace(/[۰-۹]/g, (char) => {
      return englishNumbers[persianNumbers.indexOf(char)];
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (activeTab === "register") {
      const convertedValue =
        name === "mobile_number" || name === "national_id"
          ? convertToEnglishNumbers(value)
          : value;

      setFormData({
        ...formData,
        [name]: convertedValue,
      });
    } else {
      setLoginData({
        ...loginData,
        [name]: value,
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/user/register/", formData);
      setSuccessMessage("ثبت‌نام با موفقیت انجام شد.");
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
      });
    } catch (error) {
      setErrorMessage("خطا در ثبت‌نام، لطفاً دوباره تلاش کنید.");
      setSuccessMessage("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/user/login/", loginData);

      // Store user details in localStorage
      const { token } = response.data;
      localStorage.setItem("user", JSON.stringify({ username: loginData.username, token }));

      setSuccessMessage("ورود با موفقیت انجام شد.");
      setErrorMessage("");
      setLoginData({
        username: "",
        password: "",
      });
    } catch (error) {
      setErrorMessage("نام کاربری یا رمز عبور اشتباه است.");
      setSuccessMessage("");
    }
  };

  const logout = () => {
    // Remove user details from localStorage
    localStorage.removeItem("user");
    setSuccessMessage("شما با موفقیت خارج شدید.");
  };

  return (
    <Container className="mt-5" style={{ direction: "rtl" }}>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Nav variant="tabs" defaultActiveKey="register" className="mb-4">
                <Nav.Item>
                  <Nav.Link
                    eventKey="register"
                    onClick={() => setActiveTab("register")}
                    active={activeTab === "register"}
                  >
                    ثبت‌نام
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="login"
                    onClick={() => setActiveTab("login")}
                    active={activeTab === "login"}
                  >
                    ورود
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              {successMessage && <Alert variant="success">{successMessage}</Alert>}
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

              {activeTab === "register" ? (
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
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>نام‌خانوادگی</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      placeholder="نام‌خانوادگی"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
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
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    ثبت‌نام
                  </Button>
                </Form>
              ) : (
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>نام کاربری</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="نام کاربری"
                      value={loginData.username}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>رمز عبور</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="رمز عبور"
                      value={loginData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    ورود
                  </Button>
                </Form>
              )}

              {localStorage.getItem("user") && (
                <div className="mt-4 text-center">
                  <Button variant="danger" onClick={logout}>
                    خروج
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegistrationLoginPage;
