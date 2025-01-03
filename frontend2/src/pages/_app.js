import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

// Global Axios configuration
if (typeof window !== "undefined") {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    axios.defaults.headers.common["Authorization"] = `Token ${user.token}`;
  }
}

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
