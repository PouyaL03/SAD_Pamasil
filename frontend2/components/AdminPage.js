import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Tabs, Tab, Card, Button, Form, Table, Modal } from "react-bootstrap";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [packageName, setPackageName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [initialStock, setInitialStock] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [editingPackage, setEditingPackage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchPackages();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/packages/products/");
      setProducts(response.data || []);
    } catch (error) {
      alert("❌ خطا در دریافت محصولات: " + error.message);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/packages/list/");
      setPackages(response.data || []);
    } catch (error) {
      alert("❌ خطا در دریافت پکیج‌ها: " + error.message);
    }
  };

  const handleProductSelection = (productId, quantity) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: quantity > 0 ? quantity : undefined,
    }));
  };

  const createPackage = async () => {
    const packageProducts = Object.entries(selectedProducts)
      .filter(([_, qty]) => qty > 0)
      .map(([product, quantity]) => ({ product: parseInt(product), quantity }));

    if (packageProducts.length === 0) {
      alert("❌ حداقل یک محصول را با تعداد مشخص انتخاب کنید.");
      return;
    }

    const requestData = {
      name: packageName,
      description: packageDescription,
      is_active: true,
      initial_stock: parseInt(initialStock),
      unit_price: parseFloat(unitPrice),
      package_products: packageProducts,
    };

    console.log("📤 Sending Data:", requestData);

    try {
      await axios.post("http://localhost:8000/api/packages/create/", requestData);
      alert("✅ پکیج با موفقیت ایجاد شد!");
      resetForm();
      fetchPackages();
    } catch (error) {
      alert("❌ خطا در ایجاد پکیج: " + (error.response?.data?.error || "مشکلی پیش آمد."));
    }
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setSelectedProducts(
      pkg.package_products.reduce((acc, p) => {
        acc[p.product] = p.quantity;
        return acc;
      }, {})
    );
    setShowEditModal(true);
  };

  const updatePackage = async () => {
    if (!editingPackage) return;

    const packageProducts = Object.entries(selectedProducts)
      .filter(([_, qty]) => qty > 0)
      .map(([product, quantity]) => ({ product: parseInt(product), quantity }));

    const requestData = {
      name: editingPackage.name,
      description: editingPackage.description,
      is_active: editingPackage.is_active,
      initial_stock: parseInt(editingPackage.initial_stock),
      unit_price: parseFloat(editingPackage.unit_price),
      package_products: packageProducts,
    };

    console.log("📤 Updating Data:", requestData);

    try {
      await axios.put(`http://localhost:8000/api/packages/update/${editingPackage.id}/`, requestData);
      alert("✅ پکیج با موفقیت ویرایش شد!");
      setShowEditModal(false);
      fetchPackages();
    } catch (error) {
      alert("❌ خطا در ویرایش پکیج: " + (error.response?.data?.error || "مشکلی پیش آمد."));
    }
  };

  const deletePackage = (id) => {
    if (window.confirm("آیا از حذف این پکیج مطمئن هستید؟")) {
      axios
        .delete(`http://localhost:8000/api/packages/delete/${id}/`)
        .then(() => {
          alert("✅ پکیج حذف شد!");
          fetchPackages();
        })
        .catch(() => alert("❌ خطا در حذف پکیج"));
    }
  };

  const resetForm = () => {
    setSelectedProducts({});
    setPackageName("");
    setPackageDescription("");
    setInitialStock(1);
    setUnitPrice("");
  };

  return (
    <Container style={{ padding: "20px" }}>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="products" title="ایجاد پکیج جدید">
          <Card className="p-4 shadow-sm">
            <h3 className="text-center text-primary mb-4">📦 ایجاد پکیج جدید</h3>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>📌 نام پکیج</Form.Label>
                <Form.Control type="text" value={packageName} onChange={(e) => setPackageName(e.target.value)} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>📝 توضیحات</Form.Label>
                <Form.Control type="text" value={packageDescription} onChange={(e) => setPackageDescription(e.target.value)} required />
              </Form.Group>
            </Form>
            <h4 className="mt-4">🛒 انتخاب محصولات</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>نام محصول</th>
                  <th>موجودی</th>
                  <th>تعداد در پکیج</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.initial_stock}</td>
                    <td>
                      <Form.Control type="number" min="0" onChange={(e) => handleProductSelection(product.id, parseInt(e.target.value))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button className="mt-3 w-100" onClick={createPackage} variant="success">
              ✅ ایجاد پکیج
            </Button>
          </Card>
        </Tab>

        <Tab eventKey="packages" title="مدیریت پکیج‌ها">
          <Card className="p-4 shadow-sm">
            <h3 className="text-center text-primary mb-4">📦 مدیریت پکیج‌ها</h3>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>نام پکیج</th>
                  <th>موجودی</th>
                  <th>قیمت</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td>{pkg.name}</td>
                    <td>{pkg.initial_stock}</td>
                    <td>{pkg.unit_price} تومان</td>
                    <td>{pkg.is_active ? "✅ فعال" : "❌ غیرفعال"}</td>
                    <td>
                      <Button className="me-2" variant="warning" onClick={() => openEditModal(pkg)}>✏️ ویرایش</Button>
                      <Button variant="danger" onClick={() => deletePackage(pkg.id)}>🗑 حذف</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Tab>
      </Tabs>

      {/* Edit Package Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>ویرایش پکیج</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingPackage && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>📌 نام پکیج</Form.Label>
                <Form.Control
                  type="text"
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>📝 توضیحات</Form.Label>
                <Form.Control
                  type="text"
                  value={editingPackage.description}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>📦 موجودی اولیه</Form.Label>
                <Form.Control
                  type="number"
                  value={editingPackage.initial_stock}
                  onChange={(e) => setEditingPackage({ ...editingPackage, initial_stock: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>🔄 وضعیت</Form.Label>
                <Form.Select
                  value={editingPackage.is_active ? "true" : "false"}
                  onChange={(e) => setEditingPackage({ ...editingPackage, is_active: e.target.value === "true" })}
                >
                  <option value="true">فعال</option>
                  <option value="false">غیرفعال</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>لغو</Button>
          <Button variant="primary" onClick={updatePackage}>ذخیره تغییرات</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
export default AdminPanel;

