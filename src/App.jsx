import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Layout
import MainLayout from "./layouts/MainLayout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SearchPage from "./pages/SearchPage";
import NotificationsPage from "./pages/NotificationsPage";
import { useEffect } from "react";
import ChatPage from "./pages/ChatPage";
import ChatWindow from "./pages/ChatWindow";


function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // ================= NOT LOGGED IN =================
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Force login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // ================= AUTHENTICATED USER =================
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/chat" element={<ChatPage />}>
          <Route path=":chatId" element={<ChatWindow />} />
        </Route>
        {/* <Route path="/settings" element={<SettingsPage />} /> */}
      </Route>

      {/* Block auth pages */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
