import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

if (typeof window !== 'undefined') {
  window.addEventListener('wheel', (e) => {
    if (document.activeElement && document.activeElement.type === 'number') {
      document.activeElement.blur();
    }
  }, { passive: true });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
