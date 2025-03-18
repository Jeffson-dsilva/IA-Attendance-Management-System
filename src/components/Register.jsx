import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [role, setRole] = useState("student");
  const [uname, setUname] = useState("");
  const [usn, setUsn] = useState(""); // Required only for students
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uname, usn, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      setError(error.message || "Error registering user.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Register</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block font-semibold">Full Name</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={uname}
              onChange={(e) => setUname(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Select Role</label>
            <select
              className="border p-2 w-full rounded"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
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

          <div className="mb-4">
            <label className="block font-semibold">Password</label>
            <input
              type="password"
              className="border p-2 w-full rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Confirm Password</label>
            <input
              type="password"
              className="border p-2 w-full rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700">
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
