import React, { useState, useEffect } from "react";
import axios from "axios";

const CustomerPanel = () => {
  const [cart, setCart] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the user's cart
  const fetchCart = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/cart/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure the user is authenticated
        },
      });
      setCart(response.data);
    } catch (error) {
      console.error("⚠️ خطا در دریافت سبد خرید:", error);
      setError("خطا در دریافت سبد خرید");
    }
  };

  // Fetch all packages (for adding to cart)
  const fetchPackages = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/packages/list/");
      setPackages(response.data);
    } catch (error) {
      console.error("⚠️ خطا در دریافت پکیج‌ها:", error);
      setError("خطا در دریافت پکیج‌ها");
    }
  };

  // Add a package to the cart
  const handleAddToCart = async () => {
    if (!selectedPackage || quantity < 1) {
      alert("لطفاً یک پکیج و مقدار معتبر انتخاب کنید.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/cart/add/",
        {
          package_id: selectedPackage,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(response.data.message);
      fetchCart(); // Refresh the cart
    } catch (error) {
      console.error("⚠️ خطا در افزودن به سبد خرید:", error);
      alert(error.response?.data?.error || "خطا در افزودن به سبد خرید");
    }
  };

  // Update the quantity of a cart item
  const handleUpdateCartItem = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      alert("تعداد باید حداقل ۱ باشد.");
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/cart/update/${itemId}/`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(response.data.message);
      fetchCart(); // Refresh the cart
    } catch (error) {
      console.error("⚠️ خطا در به‌روزرسانی سبد خرید:", error);
      alert(error.response?.data?.error || "خطا در به‌روزرسانی سبد خرید");
    }
  };

  // Remove a cart item
  const handleRemoveCartItem = async (itemId) => {
    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/cart/delete/${itemId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(response.data.message);
      fetchCart(); // Refresh the cart
    } catch (error) {
      console.error("⚠️ خطا در حذف از سبد خرید:", error);
      alert("خطا در حذف از سبد خرید");
    }
  };

  // Process checkout
  const handleCheckout = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/cart/checkout/",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(response.data.message);
      fetchCart(); // Refresh the cart
    } catch (error) {
      console.error("⚠️ خطا در پرداخت:", error);
      alert(error.response?.data?.error || "خطا در پرداخت");
    }
  };

  // Fetch cart and packages on component mount
  useEffect(() => {
    fetchCart();
    fetchPackages();
  }, []);

  if (loading) return <p>در حال بارگذاری...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>سبد خرید</h2>

      {/* Add to Cart Section */}
      <div>
        <h3>افزودن به سبد خرید</h3>
        <select
          value={selectedPackage || ""}
          onChange={(e) => setSelectedPackage(e.target.value)}
        >
          <option value="">انتخاب پکیج</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} - {pkg.unit_price} تومان
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="تعداد"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min="1"
        />
        <button onClick={handleAddToCart}>افزودن به سبد</button>
      </div>

      {/* Cart Items Section */}
      {cart && (
        <div>
          <h3>محصولات در سبد خرید</h3>
          {cart.items.length === 0 ? (
            <p>سبد خرید شما خالی است.</p>
          ) : (
            <ul>
              {cart.items.map((item) => (
                <li key={item.id}>
                  {item.package.name} - {item.quantity} عدد - {item.package.unit_price * item.quantity} تومان
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateCartItem(item.id, parseInt(e.target.value))}
                    min="1"
                  />
                  <button onClick={() => handleRemoveCartItem(item.id)}>حذف</button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={handleCheckout}>پرداخت</button>
        </div>
      )}
    </div>
  );
};

export default CustomerPanel;