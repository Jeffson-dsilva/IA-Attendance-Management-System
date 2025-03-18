import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("🔹 Loaded user from session:", parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("❌ Error parsing user session:", error);
          sessionStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkSession();

    // ✅ Ensure sessionStorage updates before checking user role
    const timeout = setTimeout(checkSession, 300);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    console.warn("🔴 No user found! Redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.warn(`⚠️ Unauthorized Access: ${user.role} is not allowed`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
