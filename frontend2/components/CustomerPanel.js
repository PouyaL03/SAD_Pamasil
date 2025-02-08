import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Container, Row, Col, Form, Spinner, Alert } from "react-bootstrap";

const CustomerPanel = () => {
  // States for products and filters (no add/edit/delete for customers)
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    min_stock: "",
    max_stock: "",
    name: "",
    category: "",
    sort_by_date: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Axios configuration – if authentication is needed, the customer token is used.
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const axiosConfig = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };

  // Build query parameters from filters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return params.toString();
  };

  // Fetch products from the customer endpoint
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/customer/panel/?${buildQueryParams()}`,
        axiosConfig
      );
      setProducts(response.data.products || []);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching products:", error);
      setErrorMessage("خطا در دریافت محصولات. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container style={{ direction: "rtl", maxWidth: "1200px", padding: "20px" }}>
      <h2 className="mb-4">پنل مشتری</h2>

      {/* Filter Section */}
      <div>
        <h3>فیلتر محصولات</h3>
        <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-800 p-6 rounded-lg shadow">
          <input
            type="text"
            name="name"
            placeholder="🔍 نام محصول"
            value={filters.name}
            onChange={handleFilterChange}
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            name="category"
            placeholder="📁 دسته‌بندی"
            value={filters.category}
            onChange={handleFilterChange}
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="number"
            name="min_price"
            placeholder="💰 حداقل قیمت"
            value={filters.min_price}
            onChange={handleFilterChange}
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            dir="ltr"
          />
          <input
            type="number"
            name="max_price"
            placeholder="💰 حداکثر قیمت"
            value={filters.max_price}
            onChange={handleFilterChange}
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            dir="ltr"
          />
          <input
            type="number"
            name="min_stock"
            placeholder="📦 حداقل موجودی"
            value={filters.min_stock}
            onChange={handleFilterChange}
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            dir="ltr"
          />
          <input
            type="number"
            name="max_stock"
            placeholder="📦 حداکثر موجودی"
            value={filters.max_stock}
            onChange={handleFilterChange}
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            dir="ltr"
          />
          <select
            name="sort_by_date"
            value={filters.sort_by_date}
            onChange={handleFilterChange}
            className="p-3 bg-gray-700 rounded text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="desc">📅 جدیدترین</option>
            <option value="asc">📅 قدیمی‌ترین</option>
          </select>
        </div>
      </div>

      {/* Display Products */}
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </Spinner>
        </div>
      ) : errorMessage ? (
        <Alert variant="danger" className="text-center">
          {errorMessage}
        </Alert>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product.id} sm={12} md={6} lg={4} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Img
                  variant="top"
                  src={
                    product.images
                      ? `http://127.0.0.1:8000${product.images}`
                      : "default-image.jpg"
                  }
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title style={{ fontWeight: "bold" }}>{product.name}</Card.Title>
                  <Card.Text className="text-muted">{product.short_description}</Card.Text>
                  <Card.Text>
                    <strong>📜 توضیحات:</strong> {product.long_description}
                  </Card.Text>
                  <Card.Text style={{ fontWeight: "bold", color: "#007bff" }}>
                    💰 قیمت: {Number(product.unit_price).toLocaleString()} تومان
                  </Card.Text>
                  <Card.Text>
                    <strong>📦 موجودی:</strong> {product.initial_stock}
                  </Card.Text>
                  <Card.Text>
                    <strong>🏷 دسته‌بندی:</strong> {product.category}
                  </Card.Text>
                  <Card.Text className={product.is_active ? "text-success" : "text-danger"}>
                    <strong>🔄 وضعیت:</strong> {product.is_active ? "فعال" : "غیرفعال"}
                  </Card.Text>
                  <Card.Text className="text-muted">
                    <strong>📅 تاریخ ایجاد:</strong> {new Date(product.created_at).toLocaleString()}
                  </Card.Text>
                  <Card.Text className="text-muted">
                    <strong>👤 تأمین‌کننده:</strong> {product.supplier_username}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CustomerPanel;
