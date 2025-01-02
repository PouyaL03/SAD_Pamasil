import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    national_id: '',
    date_of_birth: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("viewProfile"); // Manage active tab (view or edit)

  // Fetch user profile data when component loads
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setErrorMessage('لطفا وارد شوید');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user/profile/', {
          headers: {
            Authorization: `Token ${token}`
          }
        });
        setProfileData(response.data);
      } catch (error) {
        setErrorMessage('خطا در بارگذاری پروفایل.');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setErrorMessage('لطفا وارد شوید');
      setLoading(false);
      return;
    }

    try {
      await axios.put('http://localhost:8000/api/user/profile/', profileData, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setSuccessMessage('پروفایل با موفقیت به‌روزرسانی شد.');
      setErrorMessage('');
      setActiveTab('viewProfile'); // Switch to view profile after update
    } catch (error) {
      setErrorMessage('خطا در به‌روزرسانی پروفایل.');
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setErrorMessage('لطفا وارد شوید');
      return;
    }
  
    try {
      await axios.post('http://localhost:8000/api/user/logout/', null, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      localStorage.removeItem('user'); // Remove user data from localStorage
      setSuccessMessage('خروج با موفقیت انجام شد.');
      setErrorMessage('');
      window.location.reload(); // Refresh the page after logout
    } catch (error) {
      setErrorMessage('خطا در خروج.');
    }
  };
  
  

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">پروفایل</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Tabs for switching between profile view and edit */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav variant="pills">
          <Nav.Item>
            <Nav.Link eventKey="viewProfile">مشاهده پروفایل</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="editProfile">ویرایش پروفایل</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* View Profile Tab */}
          <Tab.Pane eventKey="viewProfile">
            {profileData.first_name && (
              <>
                <h4>نام: {profileData.first_name}</h4>
                <h4>نام خانوادگی: {profileData.last_name}</h4>
                <h4>ایمیل: {profileData.email}</h4>
                <h4>شماره موبایل: {profileData.mobile_number}</h4>
                <h4>کد ملی: {profileData.national_id}</h4>
                <h4>تاریخ تولد: {profileData.date_of_birth}</h4>
                <Button variant="warning" onClick={() => setActiveTab('editProfile')}>
                  ویرایش پروفایل
                </Button>
              </>
            )}
            {!profileData.first_name && (
              <Alert variant="info">لطفا وارد شوید تا پروفایل خود را مشاهده کنید.</Alert>
            )}
          </Tab.Pane>

          {/* Edit Profile Tab */}
          <Tab.Pane eventKey="editProfile">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>نام</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>نام خانوادگی</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ایمیل</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>شماره موبایل</Form.Label>
                <Form.Control
                  type="text"
                  name="mobile_number"
                  value={profileData.mobile_number}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>کد ملی</Form.Label>
                <Form.Control
                  type="text"
                  name="national_id"
                  value={profileData.national_id}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>تاریخ تولد</Form.Label>
                <Form.Control
                  type="date"
                  name="date_of_birth"
                  value={profileData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی پروفایل'}
              </Button>
            </Form>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Logout button */}
      <Button variant="danger" onClick={handleLogout} className="mt-3">
        خروج
      </Button>
    </Container>
  );
};

export default ProfilePage;
