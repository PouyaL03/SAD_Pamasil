import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/custom.css"; // New custom stylesheet for RTL and styling
import axios from "axios";
import { useEffect } from "react";

// Global Axios configuration
if (typeof window !== "undefined") {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    axios.defaults.headers.common["Authorization"] = `Token ${user.token}`;
  }
}

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Dynamically set the document direction based on language
    document.documentElement.dir = "rtl"; // Set to 'rtl' for Persian
    document.documentElement.lang = "fa"; // Set to Persian language
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
