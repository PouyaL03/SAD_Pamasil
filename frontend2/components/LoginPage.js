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
      setErrorMessage("نام کاربری یا رمز عبور اشتباه است.");
      setSuccessMessage("");
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">ورود</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
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
      </Form>
    </Container>
  );
};

export default LoginPage;
