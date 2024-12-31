import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";

const ProfilePage = () => {
  const [userData, setUserData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
          setErrorMessage("شما باید وارد شوید.");
          return;
        }
  
        const config = {
          headers: {
            Authorization: `Token ${user.token}`, // Adjust if using a custom token or JWT
          },
        };
  
        const response = await axios.get("http://localhost:8000/api/user/profile/", config);
        setUserData(response.data);
        setErrorMessage("");
      } catch (error) {
        // Extract and log the error details
        if (error.response) {
          // The request was made, and the server responded with a status code that falls out of the range of 2xx
          console.error("Error Response:", error.response);
          console.error("Error Data:", error.response.data);
          console.error("Error Status:", error.response.status);
          console.error("Error Headers:", error.response.headers);
          const errorDetails = `
            خطا در دریافت اطلاعات پروفایل:
            وضعیت: ${error.response.status}
            پیام: ${JSON.stringify(error.response.data)}
            هدرها: ${JSON.stringify(error.response.headers)}
            `;
          setErrorMessage(
            errorDetails
          );
        } else if (error.request) {
          // The request was made, but no response was received
          console.error("Error Request:", error.request);
          setErrorMessage("خطا در ارسال درخواست به سرور. لطفاً اتصال خود را بررسی کنید.");
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error Message:", error.message);
          setErrorMessage(`خطای ناشناخته: ${error.message}`);
        }
      }
    };
  
    fetchProfile();
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload(); // Reload the page to redirect to the login page
  };

  return (
    <Container className="mt-5" style={{ direction: "rtl" }}>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body>
              <h2 className="text-center">پروفایل کاربر</h2>
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
              {!errorMessage && (
                <div>
                  <p>
                    <strong>نام:</strong> {userData.first_name} {userData.last_name}
                  </p>
                  <p>
                    <strong>ایمیل:</strong> {userData.email}
                  </p>
                  <p>
                    <strong>نام کاربری:</strong> {userData.username}
                  </p>
                  <p>
                    <strong>شماره موبایل:</strong> {userData.mobile_number}
                  </p>
                  <p>
                    <strong>کد ملی:</strong> {userData.national_id}
                  </p>
                  <p>
                    <strong>تاریخ تولد:</strong> {userData.date_of_birth}
                  </p>
                  <Button variant="danger" onClick={handleLogout}>
                    خروج
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
