import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";

// Main App wrapper
const AppWrapper = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppWrapper />
  </BrowserRouter>
);