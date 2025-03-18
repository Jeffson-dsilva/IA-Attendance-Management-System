import { useEffect, useState } from "react";

const ManageIAMarks = () => {
  const [iaMarksData, setIaMarksData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState({});
  const [editedMarks, setEditedMarks] = useState({});
  const [filterUSN, setFilterUSN] = useState("");

  useEffect(() => {
    fetchIAMarks();
  }, []);

  const fetchIAMarks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/ia-marks");
      const data = await response.json();
      if (data.success) {
        setIaMarksData(data.records);
        setFilteredData(data.records); // Initialize filtered data
      } else {
        console.error("Error fetching IA Marks:", data.message);
      }
    } catch (error) {
      console.error("Error fetching IA Marks:", error);
    }
    setLoading(false);
  };

  const handleFilter = () => {
    if (filterUSN.trim() === "") {
      setFilteredData(iaMarksData);
    } else {
      const filtered = iaMarksData.filter(record =>
        record.usn.toLowerCase().includes(filterUSN.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const handleEdit = (id) => {
    setEditMode((prev) => ({ ...prev, [id]: true }));
    const selectedRecord = iaMarksData.find((record) => record._id === id);
    setEditedMarks((prev) => ({
      ...prev,
      [id]: { IA1: selectedRecord.IA1, IA2: selectedRecord.IA2 },
    }));
  };

  const handleChange = (id, field, value) => {
    setEditedMarks((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    try {
      const updatedData = {
        IA1: editedMarks[id].IA1,
        IA2: editedMarks[id].IA2,
      };

      const response = await fetch("http://localhost:5000/api/ia-marks/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedData }),
      });

      const result = await response.json();
      if (result.success) {
        setIaMarksData((prev) =>
          prev.map((record) =>
            record._id === id ? { ...record, ...updatedData } : record
          )
        );
        setFilteredData((prev) =>
          prev.map((record) =>
            record._id === id ? { ...record, ...updatedData } : record
          )
        );
        setEditMode((prev) => ({ ...prev, [id]: false }));
        alert("Marks updated successfully!");
      } else {
        console.error("Error updating IA Marks:", result.message);
      }
    } catch (error) {
      console.error("Error updating IA Marks:", error);
    }
  };

  if (loading) return <div className="text-center mt-6">Loading...</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Manage IA Marks</h2>

      {/* Filter Input */}
      <div className="mb-4 flex">
        <input
          type="text"
          placeholder="Enter USN to filter..."
          value={filterUSN}
          onChange={(e) => setFilterUSN(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleFilter}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {/* Table */}
      <table className="min-w-full bg-gray-100 shadow-md rounded">
        <thead>
          <tr className="bg-blue-700 text-white">
            <th className="p-2">USN</th>
            <th className="p-2">Subject</th>
            <th className="p-2">IA1 Marks</th>
            <th className="p-2">IA2 Marks</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4">No IA Marks found.</td>
            </tr>
          ) : (
            filteredData.map((record) => (
              <tr key={record._id} className="border-t text-center">
                <td className="p-2">{record.usn}</td>
                <td className="p-2">{record.subject}</td>
                <td className="p-2">
                  {editMode[record._id] ? (
                    <input
                      type="number"
                      value={editedMarks[record._id]?.IA1 ?? record.IA1}
                      onChange={(e) =>
                        handleChange(record._id, "IA1", e.target.value)
                      }
                      className="border p-1 w-16 text-center"
                    />
                  ) : (
                    record.IA1
                  )}
                </td>
                <td className="p-2">
                  {editMode[record._id] ? (
                    <input
                      type="number"
                      value={editedMarks[record._id]?.IA2 ?? record.IA2}
                      onChange={(e) =>
                        handleChange(record._id, "IA2", e.target.value)
                      }
                      className="border p-1 w-16 text-center"
                    />
                  ) : (
                    record.IA2
                  )}
                </td>
                <td className="p-2">
                  {editMode[record._id] ? (
                    <button
                      onClick={() => handleSave(record._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(record._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageIAMarks;
