// import React, { useEffect, useState } from "react";
// import { Card, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
// import axios from "axios";

// const ProductList = () => {
//   const [products, setProducts] = useState([]);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [loading, setLoading] = useState(true); // Added loading state for better UX

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const response = await axios.get("http://localhost:8000/api/products/", {
//           headers: {
//             Authorization: `Token ${user?.token}`,
//           },
//         });
//         setProducts(response.data);
//         setErrorMessage("");
//       } catch (error) {
//         setErrorMessage("خطا در دریافت اطلاعات محصولات. لطفاً وارد شوید.");
//       } finally {
//         setLoading(false); // Stop loading spinner
//       }
//     };

//     fetchProducts();
//   }, []);

//   return (
//     <Container className="mt-5" style={{ direction: "rtl", maxWidth: "1200px" }}>
//       <h1 className="text-center mb-4" style={{ fontWeight: "bold" }}>محصولات ما</h1>
//       {loading ? (
//         <div className="d-flex justify-content-center">
//           <Spinner animation="border" role="status">
//             <span className="visually-hidden">در حال بارگذاری...</span>
//           </Spinner>
//         </div>
//       ) : errorMessage ? (
//         <Alert variant="danger" className="text-center">
//           {errorMessage}
//         </Alert>
//       ) : (
//         <Row>
//           {products.map((product) => (
//             <Col key={product.id} sm={12} md={6} lg={4} className="mb-4">
//               <Card className="shadow-sm h-100">
//                 <Card.Img
//                   variant="top"
//                   src={product.image}
//                   style={{
//                     height: "200px",
//                     objectFit: "cover",
//                   }}
//                 />
//                 <Card.Body>
//                   <Card.Title style={{ fontWeight: "bold" }}>{product.name}</Card.Title>
//                   <Card.Text className="text-muted">{product.description}</Card.Text>
//                   <Card.Text style={{ fontWeight: "bold", color: "#007bff" }}>
//                     قیمت: {product.price.toLocaleString()} تومان
//                   </Card.Text>
//                   <Button variant="primary" style={{ width: "100%" }}>
//                     خرید
//                   </Button>
//                 </Card.Body>
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       )}
//     </Container>
//   );
// };

// export default ProductList;
