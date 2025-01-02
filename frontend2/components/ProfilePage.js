// import React, { useEffect, useState } from "react";
// import { Container, Alert, Button } from "react-bootstrap";
// import axios from "axios";

// const ProfilePage = () => {
//   const [userData, setUserData] = useState(null);
//   const [errorMessage, setErrorMessage] = useState("");

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const response = await axios.get("http://localhost:8000/api/user/profile/", {
//           headers: {
//             Authorization: `Token ${user.token}`,
//           },
//         });
//         setUserData(response.data);
//       } catch (error) {
//         setErrorMessage("خطا در دریافت اطلاعات پروفایل.");
//       }
//     };

//     fetchProfile();
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     window.location.href = "/";
//   };

//   return (
//     <Container className="mt-5">
//       <h2 className="text-center mb-4">پروفایل</h2>
//       {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
//       {userData && (
//         <div>
//           <p><strong>نام کاربری:</strong> {userData.username}</p>
//           <p><strong>ایمیل:</strong> {userData.email}</p>
//           <Button variant="danger" onClick={handleLogout}>
//             خروج
//           </Button>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default ProfilePage;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        setErrorMessage("شما باید وارد شوید.");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/api/user/profile/", {
          headers: {
            Authorization: `Token ${user.token}`,  // Send token in the Authorization header
          },
        });
        setUserData(response.data);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage("خطا در دریافت اطلاعات پروفایل.");
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";  // Redirect to homepage after logout
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">پروفایل</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {userData && (
        <Row>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>اطلاعات کاربری</Card.Title>
                <Card.Text>
                  <strong>نام کاربری:</strong> {userData.username}
                </Card.Text>
                <Card.Text>
                  <strong>نام:</strong> {userData.first_name}
                </Card.Text>
                <Card.Text>
                  <strong>نام خانوادگی:</strong> {userData.last_name}
                </Card.Text>
                <Card.Text>
                  <strong>ایمیل:</strong> {userData.email}
                </Card.Text>
                <Card.Text>
                  <strong>تاریخ تولد:</strong> {userData.date_of_birth}
                </Card.Text>
                <Card.Text>
                  <strong>شماره موبایل:</strong> {userData.mobile_number}
                </Card.Text>
                <Card.Text>
                  <strong>کد ملی:</strong> {userData.national_id}
                </Card.Text>
                <Button variant="danger" onClick={handleLogout}>
                  خروج
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
    </Container>
  );
};

export default ProfilePage;
