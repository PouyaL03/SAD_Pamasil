import React, { useState, useEffect }, { useState, useEffect } from "react";
import axios from "axios";
import axios from "axios";
import ProductListSupplier from "./ProductListSupplier";  // Component to show the supplier's own products
import AddProductPage from "./AddProductPage";  // Form to add new products

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
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/toggle-active/${productId}/`, {}, axiosConfig);
      alert(response.data.message);
      fetchProducts();
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/delete/${productId}/`, axiosConfig);
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const [activeTab, setActiveTab] = useState("productList");
  const [user, setUser] = useState(null);

  // Fetch logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Render the correct content based on the active tab
  const renderContent = () => {
    if (activeTab === "productList") {
      return <ProductListSupplier />;
    } else if (activeTab === "addProduct") {
      return <AddProductPage />;
    }
  };

  // Helper function to map tab names to Persian labels
  const getTabLabel = (tab) => {
    switch (tab) {
      case "productList":
        return "محصولات من";
      case "addProduct":
        return "اضافه کردن محصول";
      default:
        return tab;
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
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
            <input type="text" name="name" placeholder="نام محصول" value={filters.name} onChange={handleFilterChange} />
            <input type="text" name="category" placeholder="دسته‌بندی" value={filters.category} onChange={handleFilterChange} />
            <input type="number" name="min_price" placeholder="حداقل قیمت" value={filters.min_price} onChange={handleFilterChange} />
            <input type="number" name="max_price" placeholder="حداکثر قیمت" value={filters.max_price} onChange={handleFilterChange} />
            <input type="number" name="min_stock" placeholder="حداقل موجودی" value={filters.min_stock} onChange={handleFilterChange} />
            <input type="number" name="max_stock" placeholder="حداکثر موجودی" value={filters.max_stock} onChange={handleFilterChange} />
            <select name="is_active" value={filters.is_active} onChange={handleFilterChange}>
              <option value="">همه</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
            <select name="sort_by_date" value={filters.sort_by_date} onChange={handleFilterChange}>
              <option value="desc">جدیدترین</option>
              <option value="asc">قدیمی‌ترین</option>
            </select>
            <button onClick={fetchProducts}>اعمال فیلتر</button>
          </div>

          {/* Product List */}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {products.map((product) => (
              <li key={product.id} style={{ padding: "15px", border: "1px solid #ddd", marginBottom: "10px", borderRadius: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={selectedProducts[product.id] !== undefined}
                    onChange={() => handleProductSelection(product.id)}
                  />
                  <h4 style={{ margin: 0 }}>{product.name}</h4>
                </div>
                <p><strong>توضیحات کوتاه:</strong> {product.short_description}</p>
                <p><strong>توضیحات کامل:</strong> {product.long_description}</p>
                <p><strong>قیمت:</strong> {product.unit_price} تومان</p>
                <p><strong>موجودی:</strong> {product.initial_stock}</p>
                <p><strong>دسته‌بندی:</strong> {product.category}</p>
                <p><strong>وضعیت:</strong> {product.is_active ? "فعال" : "غیرفعال"}</p>
                {product.images && (
                  <p>
                    <strong>تصویر:</strong>
                    <img src={`http://127.0.0.1:8000${product.images}`} alt={product.name} width="150" style={{ borderRadius: "8px" }} />
                  </p>
                )}
                <p><strong>تاریخ ایجاد:</strong> {new Date(product.created_at).toLocaleString()}</p>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setEditingProduct(product)} style={actionButtonStyle("edit")}>
                    ویرایش
                  </button>
                  <button onClick={() => handleToggleActive(product.id)} style={actionButtonStyle("toggle")}>
                    {product.is_active ? "غیرفعال کردن" : "فعال کردن"}
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} style={actionButtonStyle("delete")}>
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {editingProduct && (
            <form onSubmit={handleEditProduct} style={{ marginTop: "20px" }}>
              <h4>ویرایش محصول: {editingProduct.name}</h4>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                placeholder="نام محصول"
              />
              <input
                type="text"
                value={editingProduct.short_description}
                onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                placeholder="توضیحات کوتاه"
              />
              <textarea
                value={editingProduct.long_description}
                onChange={(e) => setEditingProduct({ ...editingProduct, long_description: e.target.value })}
                placeholder="توضیحات کامل"
              />
              <input
                type="number"
                value={editingProduct.unit_price}
                onChange={(e) => setEditingProduct({ ...editingProduct, unit_price: e.target.value })}
                placeholder="قیمت واحد"
              />
              <input
                type="number"
                value={editingProduct.initial_stock}
                onChange={(e) => setEditingProduct({ ...editingProduct, initial_stock: e.target.value })}
                placeholder="موجودی"
              />
              <input
                type="text"
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                placeholder="دسته‌بندی"
              />
              <select
                value={editingProduct.is_active.toString()}
                onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.value === "true" })}
              >
                <option value="true">فعال</option>
                <option value="false">غیرفعال</option>
              </select>
              <input type="file" onChange={(e) => setEditingProduct({ ...editingProduct, images: e.target.files[0] })} />
              <button type="submit" style={actionButtonStyle("save")}>ذخیره تغییرات</button>
              <button onClick={() => setEditingProduct(null)} style={actionButtonStyle("cancel")}>لغو</button>
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
        <div>
          <h3>افزودن محصول جدید</h3>
          <form onSubmit={handleCreateProduct} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" placeholder="نام محصول" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
            <input type="text" placeholder="توضیحات کوتاه" value={newProduct.short_description} onChange={(e) => setNewProduct({ ...newProduct, short_description: e.target.value })} required />
            <textarea placeholder="توضیحات کامل" value={newProduct.long_description} onChange={(e) => setNewProduct({ ...newProduct, long_description: e.target.value })} required />
            <input type="number" placeholder="قیمت واحد" value={newProduct.unit_price} onChange={(e) => setNewProduct({ ...newProduct, unit_price: e.target.value })} required />
            <input type="number" placeholder="موجودی اولیه" value={newProduct.initial_stock} onChange={(e) => setNewProduct({ ...newProduct, initial_stock: e.target.value })} required />
            <input type="text" placeholder="دسته‌بندی" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} required />
            <input type="file" onChange={(e) => setNewProduct({ ...newProduct, images: e.target.files[0] })} />
            <button type="submit" style={actionButtonStyle("create")}>افزودن محصول</button>
          </form>
        </div>
      )}
    </div>
  );
};

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
