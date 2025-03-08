import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPanel = ({ setActiveTab }) => {
  const [activeTab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedEditProducts, setSelectedEditProducts] = useState([]); // Separate selection for edit
  const [packages, setPackages] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [newPackageName, setNewPackageName] = useState("");
  const [editPackageName, setEditPackageName] = useState("");
  const [initialStock, setInitialStock] = useState(0); // State for initial_stock during creation
  const [editInitialStock, setEditInitialStock] = useState(0); // State for initial_stock during editing
  const [unitPrice, setUnitPrice] = useState(0.0); // State for unit_price during creation
  const [editUnitPrice, setEditUnitPrice] = useState(0.0); // State for unit_price during editing

  /** ✅ Fetch All Products */
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/packages/products/");
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("⚠️ خطا در دریافت محصولات:", error);
      setProducts([]);
    }
  };

  /** ✅ Fetch All Packages */
  const fetchPackages = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/packages/list/");
      setPackages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("⚠️ خطا در دریافت پکیج‌ها:", error);
      setPackages([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPackages();
  }, []);

  /** ✅ Select Products for Creating Package */
  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  /** ✅ Select Products for Editing Package */
  const toggleEditProductSelection = (productId) => {
    setSelectedEditProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  /** ✅ Create Package */
  const handleCreatePackage = async () => {
    if (!newPackageName || selectedProducts.length === 0) {
      alert("نام پکیج و انتخاب حداقل یک محصول الزامی است.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/packages/create/", {
        name: newPackageName,
        products: selectedProducts,
        initial_stock: initialStock,
        unit_price: unitPrice, // Include unit_price in the request
      });

      alert(response.data.message);
      fetchPackages();
      setSelectedProducts([]);
      setNewPackageName("");
      setInitialStock(0); // Reset initial_stock field
      setUnitPrice(0.0); // Reset unit_price field
    } catch (error) {
      console.error("⚠️ خطا در ایجاد پکیج:", error);
      alert(error.response?.data?.initial_stock || error.response?.data?.unit_price || "خطا در ایجاد پکیج");
    }
  };

  /** ✅ Handle Edit Button Click */
  const handleEditClick = (pkg) => {
    setEditingPackage(pkg);
    setEditPackageName(pkg.name);
    setSelectedEditProducts(pkg.products.map((p) => p.id));
    setEditInitialStock(pkg.initial_stock); // Set initial_stock for editing
    setEditUnitPrice(pkg.unit_price); // Set unit_price for editing
    setTab("editPackage");
  };

  /** ✅ Edit Package */
  const handleEditPackage = async () => {
    if (!editingPackage) return;

    const updatedPackage = {
      name: editPackageName,
      products: selectedEditProducts.filter((id) => id !== null && id !== undefined), // Ensure valid IDs
      initial_stock: editInitialStock,
      unit_price: editUnitPrice, // Include unit_price in the update
    };

    if (!updatedPackage.products.length) {
      alert("باید حداقل یک محصول انتخاب کنید.");
      return;
    }

    try {
      console.log("📤 Sending Edit Request:", updatedPackage); // Debugging
      const response = await axios.put(
        `http://127.0.0.1:8000/api/packages/update/${editingPackage.id}/`,
        updatedPackage
      );

      alert(response.data.message);
      fetchPackages();
      setEditingPackage(null);
      setTab("packages");
    } catch (error) {
      console.error("⚠️ خطا در ویرایش پکیج:", error.response?.data || error);
      alert(error.response?.data?.initial_stock || error.response?.data?.unit_price || "خطا در ویرایش پکیج");
    }
  };

  /** ✅ Admin Logout */
  const handleAdminLogout = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/packages/admin/logout/");
      localStorage.removeItem("admin_token");
      alert("مدیر با موفقیت خارج شد.");
      // setActiveTab("register");
      window.location.reload();
    } catch (error) {
      console.error("⚠️ خطا در خروج:", error);
      alert("خطا در خروج.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>پنل ادمین</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setTab("products")} style={tabStyle(activeTab === "products")}>
          مشاهده محصولات
        </button>
        <button onClick={() => setTab("createPackage")} style={tabStyle(activeTab === "createPackage")}>
          ایجاد پکیج
        </button>
        <button onClick={() => setTab("packages")} style={tabStyle(activeTab === "packages")}>
          مدیریت پکیج‌ها
        </button>
      </div>

      {/* Product List */}
      {activeTab === "products" && (
        <div>
          <h3>محصولات</h3>
          {products.length === 0 ? (
            <p style={{ color: "red" }}>هیچ محصولی یافت نشد.</p>
          ) : (
            <ul>
              {products.map((product) => (
                <li key={product.id}>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                  />
                  {product.name} - {product.unit_price} تومان (موجودی: {product.initial_stock})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Create Package */}
      {activeTab === "createPackage" && (
        <div>
          <h3>ایجاد پکیج</h3>
          <input
            type="text"
            placeholder="نام پکیج"
            value={newPackageName}
            onChange={(e) => setNewPackageName(e.target.value)}
          />
          <input
            type="number"
            placeholder="موجودی اولیه"
            value={initialStock}
            onChange={(e) => setInitialStock(parseInt(e.target.value))}
          />
          <input
            type="number"
            step="0.01"
            placeholder="قیمت واحد"
            value={unitPrice}
            onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
          />
          <button onClick={handleCreatePackage}>ایجاد پکیج</button>
        </div>
      )}

      {/* Edit Package */}
      {activeTab === "editPackage" && editingPackage && (
        <div>
          <h3>ویرایش پکیج</h3>
          <input
            type="text"
            placeholder="نام پکیج"
            value={editPackageName}
            onChange={(e) => setEditPackageName(e.target.value)}
          />
          <input
            type="number"
            placeholder="موجودی اولیه"
            value={editInitialStock}
            onChange={(e) => setEditInitialStock(parseInt(e.target.value))}
          />
          <input
            type="number"
            step="0.01"
            placeholder="قیمت واحد"
            value={editUnitPrice}
            onChange={(e) => setEditUnitPrice(parseFloat(e.target.value))}
          />
          <h4>انتخاب محصولات:</h4>
          {products.length === 0 ? (
            <p style={{ color: "red" }}>هیچ محصولی یافت نشد.</p>
          ) : (
            <ul>
              {products.map((product) => (
                <li key={product.id}>
                  <input
                    type="checkbox"
                    checked={selectedEditProducts.includes(product.id)}
                    onChange={() => toggleEditProductSelection(product.id)}
                  />
                  {product.name} (موجودی: {product.initial_stock})
                </li>
              ))}
            </ul>
          )}
          <button onClick={handleEditPackage}>ذخیره تغییرات</button>
        </div>
      )}

      {/* Package List */}
      {activeTab === "packages" && (
        <div>
          <h3>لیست پکیج‌ها</h3>
          {packages.length === 0 ? (
            <p style={{ color: "red" }}>هیچ پکیجی ایجاد نشده است.</p>
          ) : (
            <ul>
              {packages.map((pkg) => (
                <li key={pkg.id}>
                  {pkg.name} ({pkg.products.length} محصول) - موجودی: {pkg.initial_stock} - قیمت: {pkg.unit_price} تومان
                  <button onClick={() => handleEditClick(pkg)}>ویرایش</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button onClick={handleAdminLogout} style={logoutButtonStyle}>
        خروج از مدیریت
      </button>
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
});

const logoutButtonStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  backgroundColor: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default AdminPanel;