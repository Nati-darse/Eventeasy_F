import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import { useToast } from "./hooks/useToast.js";

// Main App wrapper with toast functionality
const AppWrapper = () => {
  const { toasts, removeToast } = useToast();

  return (
    <ErrorBoundary>
      <AppContextProvider>
        <App />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </AppContextProvider>
    </ErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppWrapper />
  </BrowserRouter>
);