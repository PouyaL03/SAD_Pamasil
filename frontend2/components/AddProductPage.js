import React, { useState } from "react";
import axios from "axios";

const AddProductPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    long_description: "",
    unit_price: "",
    initial_stock: "",
    category: "",
    images: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")).token;

    const formDataObject = new FormData();
    Object.keys(formData).forEach((key) => formDataObject.append(key, formData[key]));

    try {
      await axios.post("http://localhost:8000/api/add/", formDataObject, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccessMessage("محصول با موفقیت اضافه شد.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("خطا در اضافه کردن محصول.");
      setSuccessMessage("");
    }
  };

  return (
    <div>
      <h3>اضافه کردن محصول</h3>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="نام محصول"
          required
        />
        <textarea
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
          placeholder="توضیحات کوتاه"
          required
        />
        <textarea
          name="long_description"
          value={formData.long_description}
          onChange={handleChange}
          placeholder="توضیحات کامل"
        />
        <input
          type="number"
          name="unit_price"
          value={formData.unit_price}
          onChange={handleChange}
          placeholder="قیمت واحد"
          required
        />
        <input
          type="number"
          name="initial_stock"
          value={formData.initial_stock}
          onChange={handleChange}
          placeholder="موجودی اولیه"
          required
        />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="دسته‌بندی"
        />
        <input
          type="file"
          name="images"
          onChange={handleImageChange}
        />
        <button type="submit">اضافه کردن محصول</button>
      </form>
    </div>
  );
};

export default AddProductPage;
