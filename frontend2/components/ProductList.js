import React, { useEffect, useState } from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await axios.get("http://localhost:8000/api/products/", {
          headers: {
            Authorization: `Token ${user?.token}`,
          },
        });
        setProducts(response.data);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage("خطا در دریافت اطلاعات محصولات. لطفاً وارد شوید.");
      }
    };

    fetchProducts();
  }, []);

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">محصولات ما</h1>
      {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
      <Row>
        {products.map((product) => (
          <Col key={product.id} sm={12} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Img variant="top" src={product.image} />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <Card.Text>قیمت: {product.price} تومان</Card.Text>
                <Button variant="primary">خرید</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ProductList;
