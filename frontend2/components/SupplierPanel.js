import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Modal,
  Form,
  Tabs,
  Tab,
} from "react-bootstrap";

const SupplierPanel = () => {
  // States for active tab, products, filters, and new product creation
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
  const initialNewProduct = {
    name: "",
    short_description: "",
    long_description: "",
    unit_price: "",
    initial_stock: "",
    category: "",
    images: null,
    is_active: true,
  };
  const [newProduct, setNewProduct] = useState(initialNewProduct);
  // Single product update modal state
  const [editingProduct, setEditingProduct] = useState(null);

  // Bulk update states
  const [selectedProducts, setSelectedProducts] = useState({});
  const [bulkActiveStatus, setBulkActiveStatus] = useState("");
  const [bulkStockAdd, setBulkStockAdd] = useState("");
  const [bulkSetStock, setBulkSetStock] = useState("");
  const [bulkPricePercent, setBulkPricePercent] = useState("");
  const [bulkSetPrice, setBulkSetPrice] = useState("");
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);

  // Axios configuration
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const axiosConfig = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };

  // When opening the bulk update modal, reset all bulk update fields
  const openBulkUpdateModal = () => {
    setBulkActiveStatus("");
    setBulkStockAdd("");
    setBulkSetStock("");
    setBulkPricePercent("");
    setBulkSetPrice("");
    setShowBulkUpdateModal(true);
  };

  // Toggle selection of a product for bulk update
  const handleProductSelection = (id) => {
    setSelectedProducts((prev) => {
      const updatedSelection = { ...prev };
      if (updatedSelection.hasOwnProperty(id)) {
        delete updatedSelection[id];
      } else {
        updatedSelection[id] = true;
      }
      return updatedSelection;
    });
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

  // Fetch products for the supplier
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/list/?${buildQueryParams()}`,
        axiosConfig
      );
      // Expect response.data.products to be an array; if not, fallback to an empty array.
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Handle changes in the filter inputs
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Create new product
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
      alert("محصول با موفقیت اضافه شد!");
      fetchProducts();
      setNewProduct(initialNewProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      alert("افزودن محصول با شکست مواجه شد.");
    }
  };

  // Single product update
  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    const formData = new FormData();
    Object.keys(editingProduct).forEach((key) => {
      formData.append(key, editingProduct[key]);
    });
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/edit/${editingProduct.id}/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("محصول با موفقیت به‌روزرسانی شد!");
      fetchProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("به‌روزرسانی محصول با شکست مواجه شد.");
    }
  };

  const handleToggleActive = async (productId) => {
    const confirmAction = window.confirm(
      "آیا مطمئن هستید که می‌خواهید وضعیت این محصول را تغییر دهید؟"
    );
    if (!confirmAction) return;
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/toggle-active/${productId}/`,
        {},
        axiosConfig
      );
      alert(response.data.message);
      fetchProducts();
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmAction = window.confirm(
      "آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟"
    );
    if (!confirmAction) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/delete/${productId}/`,
        axiosConfig
      );
      alert("محصول با موفقیت حذف شد!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Bulk update submission handler
  const handleBulkUpdateSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(selectedProducts).length === 0) {
      alert("هیچ محصولی انتخاب نشده است.");
      return;
    }
    // For each selected product, construct an update object.
    const updates = Object.keys(selectedProducts).map((id) => {
      const update = { id: parseInt(id, 10) };
      if (bulkActiveStatus !== "") {
        update.is_active = bulkActiveStatus === "true";
      }
      if (bulkSetStock !== "") {
        update.set_stock = parseInt(bulkSetStock, 10);
      } else if (bulkStockAdd !== "") {
        update.stock_add = parseInt(bulkStockAdd, 10);
      }
      if (bulkSetPrice !== "") {
        update.set_price = bulkSetPrice; // send as string
      } else if (bulkPricePercent !== "") {
        update.price_percent = parseFloat(bulkPricePercent);
      }
      return update;
    });
    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/bulk-stock-update/",
        { products: updates },
        axiosConfig
      );
      alert(response.data.message);
      fetchProducts();
      setSelectedProducts({});
      setBulkActiveStatus("");
      setBulkStockAdd("");
      setBulkSetStock("");
      setBulkPricePercent("");
      setBulkSetPrice("");
      setShowBulkUpdateModal(false);
    } catch (error) {
      console.error("Error in bulk update:", error);
      alert("خطا در به‌روزرسانی انبوه محصولات.");
    }
  };

  // Render the product list tab content
  const renderProductListTab = () => (
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

      <div style={{ marginBottom: "15px" }}>
        <Button variant="primary" onClick={openBulkUpdateModal}>
          به‌روزرسانی انبوه محصولات انتخاب‌شده
        </Button>
      </div>

      <Container className="mt-5" style={{ direction: "rtl", maxWidth: "1200px" }}>
        <h1 className="text-center mb-4" style={{ fontWeight: "bold" }}>محصولات ما</h1>
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
                  <div className="d-flex align-items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.hasOwnProperty(product.id)}
                      onChange={() => handleProductSelection(product.id)}
                      className="me-2"
                    />
                    <Card.Title style={{ fontWeight: "bold" }}>
                      {product.name}
                    </Card.Title>
                  </div>
                  <Card.Text className="text-muted">
                    {product.short_description}
                  </Card.Text>
                  <Card.Text>
                    <strong>📜 توضیحات:</strong> {product.long_description}
                  </Card.Text>
                  <Card.Text
                    style={{ fontWeight: "bold", color: "#007bff" }}
                  >
                    💰 قیمت: {product.unit_price.toLocaleString()} تومان
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
                  <div className="d-flex flex-column gap-2">
                    <Button
                      variant="warning"
                      onClick={() => setEditingProduct(product)}
                    >
                      ✏️ ویرایش
                    </Button>
                    <Button
                      variant={product.is_active ? "info" : "success"}
                      onClick={() => handleToggleActive(product.id)}
                    >
                      {product.is_active
                        ? "🚫 غیرفعال کردن"
                        : "✅ فعال کردن"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      🗑 حذف
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Bulk Update Modal */}
      <Modal
        show={showBulkUpdateModal}
        onHide={() => setShowBulkUpdateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>به‌روزرسانی انبوه محصولات</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBulkUpdateSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>تغییر وضعیت</Form.Label>
              <Form.Select
                value={bulkActiveStatus}
                onChange={(e) => setBulkActiveStatus(e.target.value)}
              >
                <option value="">-- بدون تغییر --</option>
                <option value="true">فعال</option>
                <option value="false">غیرفعال</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                تنظیم موجودی (set_stock) – در صورت وارد کردن، این مقدار جایگزین می‌شود
              </Form.Label>
              <Form.Control
                type="number"
                value={bulkSetStock}
                onChange={(e) => setBulkSetStock(e.target.value)}
                placeholder="مثلاً 100"
                dir="ltr"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                افزایش/کاهش موجودی (stock_add) – در صورت عدم وارد کردن set_stock
              </Form.Label>
              <Form.Control
                type="number"
                value={bulkStockAdd}
                onChange={(e) => setBulkStockAdd(e.target.value)}
                placeholder="مثلاً 5 یا -3"
                dir="ltr"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                تنظیم قیمت (set_price) – در صورت وارد کردن، این مقدار جایگزین می‌شود
              </Form.Label>
              <Form.Control
                type="number"
                value={bulkSetPrice}
                onChange={(e) => setBulkSetPrice(e.target.value)}
                placeholder="مثلاً 1500"
                dir="ltr"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                افزایش/کاهش قیمت به درصد (price_percent) – در صورت عدم وارد کردن set_price
              </Form.Label>
              <Form.Control
                type="number"
                value={bulkPricePercent}
                onChange={(e) => setBulkPricePercent(e.target.value)}
                placeholder="مثلاً 10 یا -5"
                dir="ltr"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowBulkUpdateModal(false)}
            >
              لغو
            </Button>
            <Button variant="primary" type="submit">
              ذخیره تغییرات
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal show={!!editingProduct} onHide={() => setEditingProduct(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>ویرایش محصول</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditProduct}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>نام محصول</Form.Label>
              <Form.Control
                type="text"
                value={editingProduct?.name || ""}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>توضیحات کوتاه</Form.Label>
              <Form.Control
                type="text"
                value={editingProduct?.short_description || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    short_description: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>توضیحات کامل</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editingProduct?.long_description || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    long_description: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>دسته‌بندی</Form.Label>
              <Form.Select
                value={editingProduct?.category || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    category: e.target.value,
                  })
                }
                required
              >
                <option value="">🏷 دسته‌بندی را انتخاب کنید</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>قیمت واحد</Form.Label>
              <Form.Control
                type="number"
                value={editingProduct?.unit_price || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    unit_price: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>موجودی</Form.Label>
              <Form.Control
                type="number"
                value={editingProduct?.initial_stock || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    initial_stock: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>تصویر محصول</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    images: e.target.files[0],
                  })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditingProduct(null)}>
              لغو
            </Button>
            <Button variant="primary" type="submit">
              ذخیره تغییرات
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );

  // Render the "Create Product" tab content
  const renderCreateProductTab = () => (
    <div className="p-6 bg-gray-900 text-black rounded-lg shadow-lg max-w-4xl mx-auto">
      <h3 className="text-2xl font-semibold mb-6 text-center text-orange-500">
        🛍️ افزودن محصول جدید
      </h3>
      <form
        onSubmit={handleCreateProduct}
        className="grid grid-cols-2 gap-4 bg-gray-800 p-6 rounded-lg shadow"
      >
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="📌 نام محصول"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            required
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="📝 توضیحات کوتاه"
            value={newProduct.short_description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, short_description: e.target.value })
            }
            required
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <textarea
            placeholder="📜 توضیحات کامل"
            value={newProduct.long_description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, long_description: e.target.value })
            }
            required
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
          />
          <select
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
            required
            className="p-3 bg-white rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">🏷 دسته‌بندی را انتخاب کنید</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-4">
          <input
            type="number"
            placeholder="💰 قیمت واحد"
            value={newProduct.unit_price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, unit_price: e.target.value })
            }
            required
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            dir="ltr"
          />
          <input
            type="number"
            placeholder="📦 موجودی اولیه"
            value={newProduct.initial_stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, initial_stock: e.target.value })
            }
            required
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            dir="ltr"
          />
          <input
            type="file"
            onChange={(e) =>
              setNewProduct({ ...newProduct, images: e.target.files[0] })
            }
            className="p-3 bg-gray-700 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6 py-3 rounded-lg text-black w-full text-lg font-bold shadow-xl transform transition duration-300 hover:scale-105"
          >
            ➕ افزودن محصول
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <Container style={{ padding: "20px" }}>
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="list" title="لیست محصولات">
          {renderProductListTab()}
        </Tab>
        <Tab eventKey="create" title="افزودن محصول جدید">
          {renderCreateProductTab()}
        </Tab>
      </Tabs>
    </Container>
  );
};

const categories = ["بادکنک", "کیک", "شمع", "استند", "غیره"];

export default SupplierPanel;
