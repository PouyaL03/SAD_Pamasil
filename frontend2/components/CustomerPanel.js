import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Form,
  Spinner,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";

const CustomerPanel = () => {
  // Two main tabs: "products" and "cart"
  const [activeTab, setActiveTab] = useState("products");

  // States for product listing
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
  const [productQuantities, setProductQuantities] = useState({}); // store quantity for each product
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");

  // States for the cart
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  // Axios configuration with authentication token
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const axiosConfig = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };

  // Build query parameters from filters for product search
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return params.toString();
  };

  // Fetch products from the customer panel endpoint
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/customer/panel/?${buildQueryParams()}`,
        axiosConfig
      );
      setProducts(response.data.products || []);
      setProductsError("");
    } catch (error) {
      console.error("Error fetching products:", error);
      setProductsError("خطا در دریافت محصولات");
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch the cart data from the backend
  const fetchCart = async () => {
    setCartLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/cart/", axiosConfig);
      setCart(response.data);
      setCartError("");
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartError("خطا در دریافت سبد خرید");
    } finally {
      setCartLoading(false);
    }
  };

  // When switching tabs or when filters change, fetch appropriate data
  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    } else if (activeTab === "cart") {
      fetchCart();
    }
  }, [activeTab, filters]);

  // Handle changes in the product filters
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Update quantity input for a given product
  const handleQuantityChange = (productId, value) => {
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  // Add a product to the cart with the specified quantity
  const handleAddToCart = async (productId) => {
    const quantity = productQuantities[productId] ? parseInt(productQuantities[productId]) : 1;
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/cart/add/",
        { product_id: productId, quantity },
        axiosConfig
      );
      alert("محصول به سبد خرید اضافه شد");
      // Optionally refresh the cart if the customer is already viewing it
      if (activeTab === "cart") {
        fetchCart();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("خطا در اضافه کردن محصول به سبد خرید");
    }
  };

  // Update an existing cart item's quantity
  const handleUpdateCartItem = async (itemId, newQuantity) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/cart/item/${itemId}/`,
        { quantity: newQuantity },
        axiosConfig
      );
      alert("مقدار آیتم سبد خرید به‌روزرسانی شد");
      fetchCart();
    } catch (error) {
      console.error("Error updating cart item:", error);
      alert("خطا در به‌روزرسانی آیتم سبد خرید");
    }
  };

  // Delete an item from the cart
  const handleDeleteCartItem = async (itemId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/cart/item/${itemId}/delete/`, axiosConfig);
      alert("آیتم سبد خرید حذف شد");
      fetchCart();
    } catch (error) {
      console.error("Error deleting cart item:", error);
      alert("خطا در حذف آیتم سبد خرید");
    }
  };

  // Checkout the cart (simulate a purchase)
  const handleCheckout = async () => {
    try {
      // Send the cart items to the backend for checkout
      const response = await axios.post(
        "http://127.0.0.1:8000/api/cart/checkout/",
        { items: cart.items }, // Ensure this matches the backend's expected format
        axiosConfig
      );
  
      // Show success message and reset the cart
      alert(`خرید موفق! مبلغ پرداختی: ${response.data.total_paid}`);
      fetchCart(); // Refresh the cart to reflect the changes
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("خطا در فرایند خرید");
    }
  };

  // Render the "Products" tab
  const renderProductsTab = () => (
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

      {productsLoading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </Spinner>
        </div>
      ) : productsError ? (
        <Alert variant="danger" className="text-center">
          {productsError}
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
                  <Card.Title style={{ fontWeight: "bold" }}>
                    {product.name}
                  </Card.Title>
                  <Card.Text className="text-muted">
                    {product.short_description}
                  </Card.Text>
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
                  <Card.Text
                    className={product.is_active ? "text-success" : "text-danger"}
                  >
                    <strong>🔄 وضعیت:</strong>{" "}
                    {product.is_active ? "فعال" : "غیرفعال"}
                  </Card.Text>
                  <Card.Text className="text-muted">
                    <strong>📅 تاریخ ایجاد:</strong>{" "}
                    {new Date(product.created_at).toLocaleString()}
                  </Card.Text>
                  <Card.Text className="text-muted">
                    <strong>👤 تأمین‌کننده:</strong>{" "}
                    {product.supplier_username}
                  </Card.Text>
                  <Form.Group className="mb-3">
                    <Form.Label>تعداد</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={productQuantities[product.id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(product.id, e.target.value)
                      }
                      style={{ width: "100px" }}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    افزودن به سبد خرید
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  // Render the "Cart" tab
  const renderCartTab = () => (
    <div>
      <h3>سبد خرید</h3>
      {cartLoading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </Spinner>
        </div>
      ) : cartError ? (
        <Alert variant="danger" className="text-center">
          {cartError}
        </Alert>
      ) : cart && cart.items && cart.items.length > 0 ? (
        <div>
          {cart.items.map((item) => (
            <Card key={item.id} className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <img
                      src={
                        item.product.images
                          ? `http://127.0.0.1:8000${item.product.images}`
                          : "default-image.jpg"
                      }
                      alt={item.product.name}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </Col>
                  <Col md={8}>
                    <h5>{item.product.name}</h5>
                    <p>{item.product.short_description}</p>
                    <p>
                      <strong>قیمت واحد:</strong>{" "}
                      {Number(item.product.unit_price).toLocaleString()} تومان
                    </p>
                    <p>
                      <strong>تعداد:</strong>{" "}
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          // Update the quantity locally in the cart state
                          setCart((prevCart) => {
                            const newItems = prevCart.items.map((ci) => {
                              if (ci.id === item.id) {
                                return { ...ci, quantity: parseInt(e.target.value) };
                              }
                              return ci;
                            });
                            return { ...prevCart, items: newItems };
                          })
                        }
                        style={{ width: "80px", display: "inline-block" }}
                      />
                    </p>
                    <Button
                      variant="success"
                      onClick={() => handleUpdateCartItem(item.id, item.quantity)}
                      className="me-2"
                    >
                      به‌روزرسانی
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteCartItem(item.id)}
                    >
                      حذف
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
          <h4>
            مجموع مبلغ: {Number(cart.total_price).toLocaleString()} تومان
          </h4>
          <Button variant="primary" onClick={handleCheckout}>
            خرید نهایی
          </Button>
        </div>
      ) : (
        <Alert variant="info">سبد خرید شما خالی است.</Alert>
      )}
    </div>
  );

  return (
    <Container style={{ padding: "20px" }}>
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="products" title="محصولات">
          {renderProductsTab()}
        </Tab>
        <Tab eventKey="cart" title="سبد خرید">
          {renderCartTab()}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default CustomerPanel;