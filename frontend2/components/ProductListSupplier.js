// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const ProductListSupplier = () => {
//   const [products, setProducts] = useState([]);
//   const [filters, setFilters] = useState({
//     name: "",
//     minPrice: "",
//     maxPrice: "",
//     minStock: "",
//     maxStock: "",
//     category: "",
//     activeStatus: "true", // Default to active products
//   });

//   // Function to fetch products with applied filters
//   const fetchProducts = async () => {
//     const token = localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")).token;
    
//     try {
//       const response = await axios.get("http://localhost:8000/api/list/", {
//         headers: {
//           Authorization: `Token ${token}`,
//         },
//         params: {
//           name: filters.name,
//           min_price: filters.minPrice,
//           max_price: filters.maxPrice,
//           min_stock: filters.minStock,
//           max_stock: filters.maxStock,
//           category: filters.category,
//           is_active: filters.activeStatus,  // Correct query parameter format for 'active' status
//         },
//       });

//       setProducts(response.data.products);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, [filters]); // Fetch products every time filters change

//   const handleFilterChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const handleAddProduct = () => {
//     // Navigate to the "Add Product" tab in Supplier Panel
//     setActiveTab("addProduct");
//   };

//   return (
//     <div>
//       <h3>محصولات شما</h3>

//       {/* Filter options */}
//       <div style={{ marginBottom: "20px" }}>
//         <input
//           type="text"
//           name="name"
//           value={filters.name}
//           onChange={handleFilterChange}
//           placeholder="نام یا کلمه کلیدی"
//         />
//         <input
//           type="number"
//           name="minPrice"
//           value={filters.minPrice}
//           onChange={handleFilterChange}
//           placeholder="حداقل قیمت"
//         />
//         <input
//           type="number"
//           name="maxPrice"
//           value={filters.maxPrice}
//           onChange={handleFilterChange}
//           placeholder="حداکثر قیمت"
//         />
//         <input
//           type="number"
//           name="minStock"
//           value={filters.minStock}
//           onChange={handleFilterChange}
//           placeholder="حداقل موجودی"
//         />
//         <input
//           type="number"
//           name="maxStock"
//           value={filters.maxStock}
//           onChange={handleFilterChange}
//           placeholder="حداکثر موجودی"
//         />
//         <input
//           type="text"
//           name="category"
//           value={filters.category}
//           onChange={handleFilterChange}
//           placeholder="دسته‌بندی"
//         />
//         <select
//           name="activeStatus"
//           value={filters.activeStatus}
//           onChange={handleFilterChange}
//         >
//           <option value="true">فعال</option>
//           <option value="false">غیرفعال</option>
//         </select>
//       </div>

//       {/* Display products */}
//       <div>
//         {products.length === 0 ? (
//           <p>محصولی یافت نشد</p>
//         ) : (
//           products.map((product) => (
//             <div key={product.id}>
//               <h4>{product.name}</h4>
//               <p>{product.short_description}</p>
//               <p>قیمت: {product.unit_price} تومان</p>
//               <p>موجودی: {product.initial_stock}</p>
//             </div>
//           ))
//         )}
//       </div>
//       <button onClick={handleAddProduct}>اضافه کردن محصول</button>
//     </div>
//   );
// };

// export default ProductListSupplier;
