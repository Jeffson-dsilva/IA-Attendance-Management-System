import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

const IAMarksPage = () => {
  const [marksData, setMarksData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIAMarks = async () => {
      try {
        const storedUser = JSON.parse(sessionStorage.getItem("user"));
        if (!storedUser || !storedUser.email) return;

        const response = await fetch(`http://localhost:5000/api/student-ia-marks?email=${storedUser.email}`);
        if (!response.ok) throw new Error("Failed to fetch IA marks");

        const data = await response.json();
        console.log("📌 IA Marks Data:", data);

        setMarksData(data.records || []);
        setFilteredData(data.records || []);
      } catch (error) {
        console.error("❌ Error fetching IA Marks:", error);
      }
      setLoading(false);
    };

    fetchIAMarks();
  }, []);

  // ✅ Filter IA Marks by Subject
  useEffect(() => {
    if (selectedSubject === "All") {
      setFilteredData(marksData);
    } else {
      setFilteredData(marksData.filter((item) => item.subject === selectedSubject));
    }
  }, [selectedSubject, marksData]);

  if (loading) return <div className="text-center mt-6">Loading...</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Internal Assessment (IA) Marks</h2>

      {/* Filter Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="font-semibold">Filter by Subject:</label>
          <select
            className="border p-2 rounded ml-2"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="All">All</option>
            {marksData.map((item, index) => (
              <option key={index} value={item.subject}>
                {item.subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* IA Marks Table & Chart */}
      <div className="grid grid-cols-2 gap-6">
        {/* Table View */}
        <div>
          <table className="min-w-full bg-gray-100 shadow-md rounded">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-2">Subject</th>
                <th className="p-2">IA1 (Out of 50)</th>
                <th className="p-2">IA2 (Out of 50)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="border-t text-center">
                  <td className="p-2">{item.subject}</td>
                  <td className="p-2">{item.IA1}</td>
                  <td className="p-2">{item.IA2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Graphical Representation */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="IA1" fill="#1D4ED8" barSize={30} />
              <Bar dataKey="IA2" fill="#82ca9d" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default IAMarksPage;
