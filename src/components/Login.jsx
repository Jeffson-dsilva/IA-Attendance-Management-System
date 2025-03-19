import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const [role, setRole] = useState("Select Role");
  const [usn, setUsn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    if (role === "Select Role") {
      setError("Please select a valid role.");
      return;
    }
  
    try {
      console.log("🔹 Sending login request...");
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log("🔹 Login response:", data);
  
      if (!response.ok) throw new Error(data.message || "Login failed");
  
      // Store user in sessionStorage
      sessionStorage.setItem("user", JSON.stringify(data.user));
      console.log("✅ User stored in sessionStorage:", sessionStorage.getItem("user"));
  
      // ✅ Delay navigation to ensure sessionStorage is updated properly
      setTimeout(() => {
        if (data.user.role === "student") navigate("/student-dashboard");
        else if (data.user.role === "faculty") navigate("/faculty-dashboard");
        else if (data.user.role === "hod") navigate("/hod-dashboard");
        else navigate("/unauthorized");
      }, 100); // Small delay for session storage sync
  
    } catch (error) {
      setError(error.message || "Invalid credentials!");
      console.error("❌ Login error:", error);
    }
  };
  
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Login</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block font-semibold">Select Role</label>
            <select
              className="border p-2 w-full rounded"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Select Role">Select Role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="hod">HOD</option>
            </select>
          </div>

          {role === "student" && (
            <div className="mb-4">
              <label className="block font-semibold">USN</label>
              <input
                type="text"
                className="border p-2 w-full rounded"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block font-semibold">Email</label>
            <input
              type="email"
              className="border p-2 w-full rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <label className="block font-semibold">Password</label>
            <input
              type="password"
              className="border p-2 w-full rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700">
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
