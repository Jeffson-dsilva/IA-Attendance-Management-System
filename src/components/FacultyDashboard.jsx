import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaChalkboardTeacher,
  FaUserCheck,
  FaClipboardList,
  FaBookOpen,
  FaUserGraduate,
  FaSignOutAlt,
} from "react-icons/fa";
import ManageAttendance from "./ManageAttendance";
import ManageIAMarks from "./ManageIAMarks";
import ManageCourseFiles from "./ManageCourseFiles";
import BulkUpload from "./BulkUpload";
import StudentPerformance from "./StudentPerformance";

const FacultyDashboard = () => {
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacultyData = async () => {
      // 🔹 Fetch user object from session storage
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) {
        console.warn("🔴 No faculty session found! Redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        const email = user.email; // ✅ Extract email from stored user
        console.log(`🔹 Fetching faculty data for: ${email}`);

        const response = await fetch(`http://localhost:5000/api/users/${email}`);
        if (!response.ok) throw new Error("Failed to fetch faculty data");

        const data = await response.json();
        setFaculty(data.user);
      } catch (error) {
        console.error("❌ Error fetching faculty data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("user"); // ✅ Remove full user object
    navigate("/login");
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <div className={`bg-blue-700 text-white p-5 flex flex-col transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <button className="mb-4 self-end text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <nav className="flex flex-col space-y-4">
          <button className={`flex items-center p-2 rounded ${activeTab === "dashboard" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <FaChalkboardTeacher /> {sidebarOpen && <span className="ml-2">Dashboard</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "manage-attendance" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("manage-attendance")}>
            <FaUserCheck /> {sidebarOpen && <span className="ml-2">Manage Attendance</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "ia-marks" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("ia-marks")}>
            <FaClipboardList /> {sidebarOpen && <span className="ml-2">IA Marks</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "course-files" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("course-files")}>
            <FaBookOpen /> {sidebarOpen && <span className="ml-2">Course Files</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "student-performance" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("student-performance")}>
            <FaUserGraduate /> {sidebarOpen && <span className="ml-2">Student Performance</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "bulk-attendance" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("bulk-attendance")}>
            <FaClipboardList /> {sidebarOpen && <span className="ml-2">Upload Attendance</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "bulk-marks" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("bulk-marks")}>
            <FaClipboardList /> {sidebarOpen && <span className="ml-2">Upload IA Marks</span>}
          </button>
          <button className="flex items-center p-2 rounded bg-red-500" onClick={handleLogout}>
            <FaSignOutAlt /> {sidebarOpen && <span className="ml-2">Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-6 transition-all duration-300">
        {/* Header */}
        <div className="bg-blue-700 shadow-md p-4 flex items-center justify-between w-full rounded-lg">
          <img src="/collegelogo.png" alt="College Logo" className="h-15" />
          <p className="text-white text-lg font-semibold">{faculty?.uname}</p>
        </div>

        {/* Dynamic Content */}
        <div className="mt-6">
          {activeTab === "dashboard" && (
            <div className="p-4 bg-white shadow-md rounded">
              <h2 className="text-xl font-semibold text-blue-700">Welcome, {faculty?.uname}!</h2>
              <p className="text-gray-700">Email: {faculty?.email}</p>
            </div>
          )}
          {activeTab === "manage-attendance" && <ManageAttendance faculty={faculty} />}
          {activeTab === "ia-marks" && <ManageIAMarks faculty={faculty} />}
          {activeTab === "course-files" && <ManageCourseFiles faculty={faculty} />}
          {activeTab === "student-performance" && <StudentPerformance />}

        {activeTab === "bulk-attendance" && <BulkUpload type="attendance" />}
          {activeTab === "bulk-marks" && <BulkUpload type="ia-marks" />}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
