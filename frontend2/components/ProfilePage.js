import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert, Tab, Nav } from "react-bootstrap";
import axios from "axios";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    national_id: "",
    date_of_birth: "",
    role: "",
  });

  const [editProfileData, setEditProfileData] = useState(null); // Temporary edit state
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("viewProfile");

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    if (!token) {
      setErrorMessage("لطفا وارد شوید");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user/profile/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setProfileData(response.data);
        setEditProfileData(response.data); // Initialize temporary state
      } catch (error) {
        setErrorMessage("خطا در بارگذاری پروفایل.");
      }
    };

    fetchProfile();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData({ ...editProfileData, [name]: value }); // Update only temporary state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate fields
    const { first_name, last_name, date_of_birth } = editProfileData;
    if (!first_name.trim() || !last_name.trim() || !date_of_birth.trim()) {
      setErrorMessage("لطفاً تمام فیلدهای ضروری را پر کنید.");
      setLoading(false);
      return;
    }

    // Check if changes were made
    if (JSON.stringify(editProfileData) === JSON.stringify(profileData)) {
      setErrorMessage("تغییری برای ذخیره وجود ندارد.");
      setLoading(false);
      return;
    }

    const token = JSON.parse(localStorage.getItem("user"))?.token;
    if (!token) {
      setErrorMessage("لطفا وارد شوید");
      setLoading(false);
      return;
    }

    try {
      await axios.put("http://localhost:8000/api/user/profile/", editProfileData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setSuccessMessage("پروفایل با موفقیت به‌روزرسانی شد.");
      setErrorMessage("");
      setProfileData(editProfileData); // Save edits to the main state
      setActiveTab("viewProfile");
    } catch (error) {
      setErrorMessage("خطا در به‌روزرسانی پروفایل.");
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    if (!token) {
      setErrorMessage("لطفا وارد شوید");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/user/logout/", null, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      localStorage.removeItem("user");
      setSuccessMessage("خروج با موفقیت انجام شد.");
      setErrorMessage("");
      window.location.reload();
    } catch (error) {
      setErrorMessage("خطا در خروج.");
    }
  };

  const handleDeleteAccount = async () => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    if (!token) {
      setErrorMessage("لطفا وارد شوید");
      return;
    }

    try {
      await axios.delete("http://localhost:8000/api/user/profile/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      localStorage.removeItem("user");
      setSuccessMessage("حساب شما با موفقیت حذف شد.");
      setErrorMessage("");
      window.location.reload();
    } catch (error) {
      setErrorMessage("خطا در حذف حساب.");
    }
  };

  return (
    <Container className="mt-5" style={{ direction: "rtl", maxWidth: "700px" }}>
      <h2 className="text-center mb-4" style={{ fontWeight: "bold" }}>پروفایل</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav variant="pills" className="justify-content-center mb-3">
          <Nav.Item>
            <Nav.Link eventKey="viewProfile" style={{ textAlign: "center" }}>
              مشاهده پروفایل
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="editProfile" style={{ textAlign: "center" }}>
              ویرایش پروفایل
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="viewProfile">
            {profileData.first_name ? (
              <>
                <div className="mb-3">
                  <strong>نام:</strong> {profileData.first_name}
                </div>
                <div className="mb-3">
                  <strong>نام خانوادگی:</strong> {profileData.last_name}
                </div>
                <div className="mb-3">
                  <strong>ایمیل:</strong> {profileData.email}
                </div>
                <div className="mb-3">
                  <strong>شماره موبایل:</strong> {profileData.mobile_number}
                </div>
                <div className="mb-3">
                  <strong>کد ملی:</strong> {profileData.national_id}
                </div>
                <div className="mb-3">
                  <strong>تاریخ تولد:</strong> {profileData.date_of_birth}
                </div>
                <div className="mb-3">
                  <strong>نقش:</strong> {profileData.role}
                </div>
                <Button variant="danger" onClick={handleDeleteAccount} className="mt-3">
                  حذف حساب کاربری
                </Button>
              </>
            ) : (
              <Alert variant="info">لطفا وارد شوید تا پروفایل خود را مشاهده کنید.</Alert>
            )}
          </Tab.Pane>

          <Tab.Pane eventKey="editProfile">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>نام</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={editProfileData?.first_name || ""}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>نام خانوادگی</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={editProfileData?.last_name || ""}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ایمیل</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editProfileData?.email || ""}
                  readOnly
                  style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                />
                <Form.Text className="text-muted">ایمیل شما قابل تغییر نیست.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>شماره موبایل</Form.Label>
                <Form.Control
                  type="text"
                  name="mobile_number"
                  value={editProfileData?.mobile_number || ""}
                  readOnly
                  style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                />
                <Form.Text className="text-muted">شماره موبایل شما قابل تغییر نیست.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>کد ملی</Form.Label>
                <Form.Control
                  type="text"
                  name="national_id"
                  value={editProfileData?.national_id || ""}
                  readOnly
                  style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                />
                <Form.Text className="text-muted">کد ملی شما قابل تغییر نیست.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>تاریخ تولد</Form.Label>
                <Form.Control
                  type="date"
                  name="date_of_birth"
                  value={editProfileData?.date_of_birth || ""}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={loading} className="w-100">
                {loading ? "در حال به‌روزرسانی..." : "به‌روزرسانی پروفایل"}
              </Button>
            </Form>
          </Tab.Pane>

        </Tab.Content>
      </Tab.Container>

      <Button variant="danger" onClick={handleLogout} className="mt-3 w-100">
        خروج
      </Button>
    </Container>
  );
};

export default ProfilePage;
