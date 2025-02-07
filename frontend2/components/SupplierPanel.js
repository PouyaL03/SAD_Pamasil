import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Button, Container, Row, Col,Modal, Form, Alert, Spinner, CardHeader, CardTitle} from "react-bootstrap";

const SupplierPanel = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    min_stock: "",
    max_stock: "",
    name: "",
    category: "",
    is_active: "",
    sort_by_date: "desc",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    short_description: "",
    long_description: "",
    unit_price: "",
    initial_stock: "",
    category: "",
    images: null,
    is_active: true,
  });
  const [editingProduct, setEditingProduct] = useState(null);

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const axiosConfig = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };

  const [selectedProducts, setSelectedProducts] = useState({});
const [bulkStockValue, setBulkStockValue] = useState("");

const handleProductSelection = (id) => {
  setSelectedProducts((prev) => {
    const updatedSelection = { ...prev };
    if (updatedSelection[id]) {
      delete updatedSelection[id]; // Deselect the product
    } else {
      updatedSelection[id] = bulkStockValue; // Select the product with bulk stock value
    }
    return updatedSelection;
  });
};


const handleBulkStockUpdate = async () => {
  if (Object.keys(selectedProducts).length === 0) {
    alert("هیچ محصولی برای به‌روزرسانی انتخاب نشده است.");
    return;
  }

  const productsToUpdate = Object.keys(selectedProducts).map((id) => ({
    id,
    new_stock: bulkStockValue,
  }));

  try {
    const response = await axios.put(
      "http://127.0.0.1:8000/api/bulk-stock-update/",
      { products: productsToUpdate },
      axiosConfig
    );
    alert(response.data.message);
    fetchProducts();
    setSelectedProducts({});
    setBulkStockValue("");
  } catch (error) {
    console.error("Error updating stock in bulk:", error);
    alert("خطا در به‌روزرسانی انبوه موجودی.");
  }
};



  const buildQueryParams = () => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return params.toString();
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/list/?${buildQueryParams()}`, axiosConfig);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in newProduct) {
      formData.append(key, newProduct[key]);
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/add/", formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Product added successfully!");
      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to add product.");
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formData = new FormData();
    Object.keys(editingProduct).forEach((key) => {
      formData.append(key, editingProduct[key]);
    });

    try {
      await axios.put(`http://127.0.0.1:8000/api/edit/${editingProduct.id}/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Product updated successfully!");
      fetchProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  const handleToggleActive = async (productId) => {
    const confirmAction = window.confirm("آیا مطمئن هستید که می‌خواهید وضعیت این محصول را تغییر دهید؟");
    if (!confirmAction) return;

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/toggle-active/${productId}/`, {}, axiosConfig);
      alert(response.data.message);
      fetchProducts();
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmAction = window.confirm("آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟");
    if (!confirmAction) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/delete/${productId}/`, axiosConfig);
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>پنل تأمین‌کننده</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("list")} style={tabStyle(activeTab === "list")}>
          لیست محصولات
        </button>
        <button onClick={() => setActiveTab("create")} style={tabStyle(activeTab === "create")}>
          افزودن محصول جدید
        </button>
      </div>

      {/* Product List with Filters */}
      {activeTab === "list" && (
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
            />
            <input
              type="number"
              name="max_price"
              placeholder="💰 حداکثر قیمت"
              value={filters.max_price}
              onChange={handleFilterChange}
              className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              name="min_stock"
              placeholder="📦 حداقل موجودی"
              value={filters.min_stock}
              onChange={handleFilterChange}
              className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              name="max_stock"
              placeholder="📦 حداکثر موجودی"
              value={filters.max_stock}
              onChange={handleFilterChange}
              className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              name="is_active"
              value={filters.is_active}
              onChange={handleFilterChange}
              className="p-3 bg-gray-700 rounded text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">🔄 همه</option>
              <option value="true">✅ فعال</option>
              <option value="false">❌ غیرفعال</option>
            </select>
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

          {/* Product List */}
          <Container className="mt-5" style={{ direction: "rtl", maxWidth: "1200px" }}>
      <h1 className="text-center mb-4" style={{ fontWeight: "bold" }}>محصولات ما</h1>
      <Row>
        {products.map((product) => (
          <Col key={product.id} sm={12} md={6} lg={4} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Img
                variant="top"
                src={product.images ? `http://127.0.0.1:8000${product.images}` : "default-image.jpg"}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts[product.id] !== undefined}
                    onChange={() => handleProductSelection(product.id)}
                    className="me-2"
                  />
                  <Card.Title style={{ fontWeight: "bold" }}>{product.name}</Card.Title>
                </div>
                <Card.Text className="text-muted">{product.short_description}</Card.Text>
                <Card.Text><strong>📜 توضیحات:</strong> {product.long_description}</Card.Text>
                <Card.Text style={{ fontWeight: "bold", color: "#007bff" }}>
                  💰 قیمت: {product.unit_price.toLocaleString()} تومان
                </Card.Text>
                <Card.Text><strong>📦 موجودی:</strong> {product.initial_stock}</Card.Text>
                <Card.Text><strong>🏷 دسته‌بندی:</strong> {product.category}</Card.Text>
                <Card.Text className={product.is_active ? "text-success" : "text-danger"}>
                  <strong>🔄 وضعیت:</strong> {product.is_active ? "فعال" : "غیرفعال"}
                </Card.Text>
                <Card.Text className="text-muted"><strong>📅 تاریخ ایجاد:</strong> {new Date(product.created_at).toLocaleString()}</Card.Text>
                <div className="d-flex flex-column gap-2">
                  <Button variant="warning" onClick={() => setEditingProduct(product)}>
                    ✏️ ویرایش
                  </Button>
                  <Button variant={product.is_active ? "info" : "success"} onClick={() => handleToggleActive(product.id)}>
                    {product.is_active ? "🚫 غیرفعال کردن" : "✅ فعال کردن"}
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteProduct(product.id)}>
                    🗑 حذف
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>

          {editingProduct && (
            <form onSubmit={handleEditProduct} className="grid grid-cols-2 gap-4 bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="📌 نام محصول"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                  className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="📝 توضیحات کوتاه"
                  value={editingProduct.short_description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                  required
                  className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <textarea
                  placeholder="📜 توضیحات کامل"
                  value={editingProduct.long_description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, long_description: e.target.value })}
                  required
                  className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                />
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  required
                  className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">🏷 دسته‌بندی را انتخاب کنید</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-4">
                <input
                  type="number"
                  placeholder="💰 قیمت واحد"
                  value={editingProduct.unit_price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, unit_price: e.target.value })}
                  required
                  className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="number"
                  placeholder="📦 موجودی"
                  value={editingProduct.initial_stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, initial_stock: e.target.value })}
                  required
                  className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="file"
                  onChange={(e) => setEditingProduct({ ...editingProduct, images: e.target.files[0] })}
                  className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-black w-full text-lg font-bold shadow-lg transition duration-300 ease-in-out flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">💾</span> ذخیره تغییرات
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-black w-full text-lg font-bold shadow-lg transition duration-300 ease-in-out flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">❌</span> لغو
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Bulk Stock Update Section */}
      <div style={{ marginBottom: "15px" }}>
        <h4>به‌روزرسانی انبوه موجودی</h4>
        <input
          type="number"
          placeholder="موجودی جدید برای همه محصولات انتخاب‌شده"
          value={bulkStockValue}
          onChange={(e) => setBulkStockValue(e.target.value)}
        />
        <button onClick={handleBulkStockUpdate} style={actionButtonStyle("save")}>
          به‌روزرسانی انبوه
        </button>
      </div>

      {/* Create Product */}
      {activeTab === "create" && (
        <div className="p-6 bg-gray-900 text-black rounded-lg shadow-lg max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold mb-6 text-center text-orange-500">🛍️ افزودن محصول جدید</h3>
        
        <form onSubmit={handleCreateProduct} className="grid grid-cols-2 gap-4 bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="📌 نام محصول"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
              className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              placeholder="📝 توضیحات کوتاه"
              value={newProduct.short_description}
              onChange={(e) => setNewProduct({ ...newProduct, short_description: e.target.value })}
              required
              className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <textarea
              placeholder="📜 توضیحات کامل"
              value={newProduct.long_description}
              onChange={(e) => setNewProduct({ ...newProduct, long_description: e.target.value })}
              required
              className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
            />
            <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            required
            className="p-3 bg-white rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">🏷 دسته‌بندی را انتخاب کنید</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-4">
            <input
              type="number"
              placeholder="💰 قیمت واحد"
              value={newProduct.unit_price}
              onChange={(e) => setNewProduct({ ...newProduct, unit_price: e.target.value })}
              required
              className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              placeholder="📦 موجودی اولیه"
              value={newProduct.initial_stock}
              onChange={(e) => setNewProduct({ ...newProduct, initial_stock: e.target.value })}
              required
              className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="file"
              onChange={(e) => setNewProduct({ ...newProduct, images: e.target.files[0] })}
              className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6 py-3 rounded-lg text-black w-full text-lg font-bold shadow-xl transform transition duration-300 hover:scale-105">
            ➕ افزودن محصول
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};

const categories = ["بادکنک", "کیک", "شمع", "استند", "غیره"];

const tabStyle = (isActive) => ({
  padding: "10px 20px",
  backgroundColor: isActive ? "#007bff" : "#fff",
  color: isActive ? "#fff" : "#007bff",
  border: "2px solid #007bff",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
});

const actionButtonStyle = (type) => {
  const colors = {
    edit: "#ffc107",
    toggle: "#17a2b8",
    delete: "#dc3545",
    save: "#28a745",
    cancel: "#6c757d",
    create: "#007bff",
  };

  return {
    padding: "8px 12px",
    backgroundColor: colors[type],
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  };
};

export default SupplierPanel;
