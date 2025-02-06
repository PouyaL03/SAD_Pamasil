import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/router";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if the user is a supplier before allowing access
    const user = JSON.parse(localStorage.getItem("user"));
    // if (!user.) { // check if user is a supplier
    if (!user) {
      setMessage("You are not a supplier");
      router.push("/"); // Redirect to homepage if not a supplier
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const response = await axios.post("http://localhost:8000/api/add-product/", product, {
        headers: { Authorization: `Token ${token}` },
      });
      setMessage("محصول با موفقیت اضافه شد.");
      setProduct({ name: "", description: "", price: "", stock: "", category: "" });
    } catch (error) {
      console.error("Error Details:", error.response); // Log the full error response
      if (error.response) {
        // The server responded with a status outside 2xx range
        setErrorMessage(`خطا: ${error.response.status} - ${error.response.data?.message}`);
      } else if (error.request) {
        // The request was made but no response was received
        setErrorMessage("خطای شبکه! لطفا اتصال اینترنت را بررسی کنید.");
      } else {
        // Other errors (unexpected)
        setErrorMessage("مشکلی رخ داده است. لطفا دوباره تلاش کنید.");
      }
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "600px", direction: "rtl" }}>
      <h2 className="text-center mb-4" style={{ fontWeight: "bold" }}>افزودن محصول</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>نام محصول</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="نام محصول"
            value={product.name}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>توضیحات محصول</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            placeholder="توضیحات محصول"
            value={product.description}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>قیمت</Form.Label>
          <Form.Control
            type="number"
            name="price"
            placeholder="قیمت"
            value={product.price}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>موجودی</Form.Label>
          <Form.Control
            type="number"
            name="stock"
            placeholder="موجودی"
            value={product.stock}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>دسته‌بندی</Form.Label>
          <Form.Control
            type="text"
            name="category"
            placeholder="دسته‌بندی"
            value={product.category}
            onChange={handleChange}
            required
            style={{ textAlign: "right" }}
          />
        </Form.Group>
        <Button variant="primary" type="submit" style={{ width: "100%" }}>
          افزودن محصول
        </Button>
      </Form>
    </Container>
  );
};

export default AddProduct;
