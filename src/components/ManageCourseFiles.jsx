import { useState, useEffect } from "react";
import { FaUpload, FaTrash, FaDownload } from "react-icons/fa";

const ManageCourseFiles = () => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem("user")); // Get user from session

  useEffect(() => {
    if (user) {
      fetchCourseFiles();
    }
  }, [user]);

  // Fetch Course Files
  const fetchCourseFiles = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/course-files/${user._id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setFiles(data.files);
    } catch (error) {
      console.error("Error fetching course files:", error);
    }

    setLoading(false);
  };

  // Handle File Upload
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("facultyId", user._id);

    try {
      const response = await fetch("http://localhost:5000/api/upload-course-file", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert("File uploaded successfully!");
      setFile(null);
      fetchCourseFiles(); // Refresh file list
    } catch (error) {
      console.error("Error uploading file:", error);
    }

    setUploading(false);
  };

  // Handle File Delete
  const handleDelete = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/delete-course-file/${fileId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      fetchCourseFiles(); // Refresh file list
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Manage Course Files</h2>

      {/* File Upload Section */}
      <div className="mb-4">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded ml-2"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : <><FaUpload className="inline mr-2" /> Upload</>}
        </button>
      </div>

      {/* File List Section */}
      {loading ? <p>Loading files...</p> : (
        <table className="min-w-full bg-gray-100 shadow-md rounded">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="p-2">File Name</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center p-4">No files uploaded.</td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file._id} className="border-t text-center">
                  <td className="p-2">{file.fileName}</td>
                  <td className="p-2">
                    <a href={file.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 mr-2">
                      <FaDownload />
                    </a>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(file._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageCourseFiles;
