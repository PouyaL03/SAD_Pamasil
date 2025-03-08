import React, { useState, useEffect } from "react";
import axios from "axios";

const CartPage = () => {
  const [packages, setPackages] = useState([]); // List of available packages
  const [cart, setCart] = useState([]); // Cart items
  const [totalPrice, setTotalPrice] = useState(0);
  const [checkoutErrors, setCheckoutErrors] = useState([]); // Error messages
  const [loading, setLoading] = useState(false); // Loading state for checkout

  const token = JSON.parse(localStorage.getItem("user"))?.token; // User authentication token

  const axiosConfig = {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  };

  /** ✅ Fetch Available Packages */
  const fetchPackages = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/packages/list/");
      setPackages(response.data);
    } catch (error) {
      console.error("⚠️ خطا در دریافت پکیج‌ها:", error);
    }
  };

  /** ✅ Fetch User's Cart */
  const fetchCart = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/cart/", axiosConfig);
      setCart(response.data.items || []);
      setTotalPrice(response.data.total_price || 0);
    } catch (error) {
      console.error("⚠️ خطا در دریافت سبد خرید:", error);
    }
  };

  /** ✅ Add a Package to Cart */
  const addToCart = async (packageId) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/cart/add/",
        { package: packageId, quantity: 1 },
        axiosConfig
      );
      alert(response.data.message);
      fetchCart(); // Refresh cart
    } catch (error) {
      console.error("⚠️ خطا در افزودن به سبد خرید:", error);
      alert("خطا در افزودن به سبد خرید");
    }
  };

  /** ✅ Update Cart Item Quantity */
  const updateCartItem = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/cart/item/${itemId}/`,
        { quantity: newQuantity },
        axiosConfig
      );
      fetchCart(); // Refresh cart
    } catch (error) {
      console.error("⚠️ خطا در به‌روزرسانی سبد خرید:", error);
      alert("خطا در به‌روزرسانی سبد خرید");
    }
  };

  /** ✅ Remove an Item from Cart */
  const removeCartItem = async (itemId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/cart/item/${itemId}/delete/`, axiosConfig);
      fetchCart(); // Refresh cart
    } catch (error) {
      console.error("⚠️ خطا در حذف آیتم از سبد خرید:", error);
      alert("خطا در حذف آیتم از سبد خرید");
    }
  };

  /** ✅ Checkout with Error Handling */
  const handleCheckout = async () => {
    try {
      if (!token) {
        alert("کاربر احراز هویت نشده است!");
        return;
      }

      setLoading(true);
      setCheckoutErrors([]); // Reset errors

      // ✅ Ensure cart items are structured correctly
      const formattedItems = cart.map((item) => ({
        package: item.package.id, // ✅ Send package ID directly
        quantity: item.quantity,
      }));

      const response = await axios.post(
        "http://127.0.0.1:8000/api/cart/checkout/",
        { items: formattedItems }, // ✅ Correct structure
        axiosConfig
      );

      alert("✅ پرداخت موفق! مبلغ کل: " + response.data.total_paid + " تومان");
      fetchCart(); // Refresh cart after checkout
    } catch (error) {
      console.error("Checkout failed:", error.response?.data || error.message);

      // ✅ Handle specific backend errors
      if (error.response) {
        const errorData = error.response.data;
        const errorsArray = [];

        if (errorData.details && Array.isArray(errorData.details)) {
          errorsArray.push(...errorData.details);
        } else if (errorData.error) {
          errorsArray.push({ error: errorData.error });
        } else {
          errorsArray.push({ error: "خطای نامشخص در انجام پرداخت" });
        }

        setCheckoutErrors(errorsArray);
      } else {
        setCheckoutErrors([{ error: "ارتباط با سرور برقرار نشد." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPackages();
    fetchCart();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛒 سبد خرید</h2>

      {/* 📦 Available Packages */}
      <div>
        <h3>📦 لیست پکیج‌ها</h3>
        {packages.length === 0 ? (
          <p style={{ color: "red" }}>هیچ پکیجی یافت نشد.</p>
        ) : (
          <ul>
            {packages.map((pkg) => (
              <li key={pkg.id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {pkg.name} - شامل {pkg.products.length} محصول
                <button onClick={() => addToCart(pkg.id)} style={buttonStyle("add")}>
                  افزودن به سبد خرید
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🛒 User's Cart */}
      <div>
        <h3>🛍️ سبد خرید شما</h3>
        {cart.length === 0 ? (
          <p style={{ color: "red" }}>سبد خرید شما خالی است.</p>
        ) : (
          <ul>
            {cart.map((item) => (
              <li key={item.id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                <span>{item.package.name} - تعداد: {item.quantity}</span>
                <button onClick={() => updateCartItem(item.id, item.quantity + 1)} style={buttonStyle("update")}>
                  ➕ افزایش
                </button>
                <button onClick={() => updateCartItem(item.id, item.quantity - 1)} style={buttonStyle("update")} disabled={item.quantity <= 1}>
                  ➖ کاهش
                </button>
                <button onClick={() => removeCartItem(item.id)} style={buttonStyle("remove")}>
                  ❌ حذف
                </button>
              </li>
            ))}
          </ul>
        )}
        <h4>💰 مجموع: {totalPrice} تومان</h4>

        {/* 🛒 Checkout Button */}
        <button onClick={handleCheckout} style={buttonStyle("checkout")} disabled={cart.length === 0 || loading}>
          {loading ? "در حال پردازش..." : "🛒 نهایی کردن خرید"}
        </button>

        {/* 🚨 Display Checkout Errors */}
        {checkoutErrors.length > 0 && (
          <div style={{ color: "red", marginTop: "10px" }}>
            <p>⚠️ خطا در خرید:</p>
            <ul>
              {checkoutErrors.map((err, index) => (
                <li key={index}>{err.error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const buttonStyle = (type) => ({
  marginLeft: "10px",
  padding: "5px 10px",
  backgroundColor: { add: "#28a745", update: "#007bff", remove: "#dc3545", checkout: "#ffc107" }[type],
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
});

export default CartPage;
