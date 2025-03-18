import { useState } from "react";
import * as XLSX from "xlsx";

const BulkUpload = ({ type }) => {
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile || (type === "attendance" && (!date || !hour))) {
      setError("Please select a file, date, and hour for attendance upload.");
      return;
    }

    setLoading(true);
    setError("");

    const reader = new FileReader();
    reader.readAsBinaryString(selectedFile);

    reader.onload = async (e) => {
      try {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length === 0) {
          setError("The uploaded file is empty.");
          setLoading(false);
          return;
        }

        const apiEndpoint = type === "attendance" ? "http://localhost:5000/api/upload-attendance" : "http://localhost:5000/api/upload-ia-marks";

        const formattedData = jsonData.map(record => ({
          usn: record["USN"],
          subject: record["Subject"],
          ...(type === "attendance"
            ? { date, hour, status: record["Status"] }
            : { IA1: Number(record["IA1"]) || 0, IA2: Number(record["IA2"]) || 0 }
          ),
        }));

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Upload failed.");

        alert("File uploaded successfully!");
      } catch (err) {
        console.error("Error uploading file:", err);
        setError("Error processing file. Please check the format.");
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700">
        Upload {type === "attendance" ? "Attendance" : "IA Marks"}
      </h2>

      {type === "attendance" && (
        <>
          <div className="mb-2">
            <label className="block font-semibold">Select Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded w-full"/>
          </div>

          <div className="mb-2">
            <label className="block font-semibold">Select Hour:</label>
            <select value={hour} onChange={(e) => setHour(e.target.value)} className="border p-2 rounded w-full">
              <option value="">Select Hour</option>
              <option value="9:00am-9:55am">9:00am-9:55am</option>
              <option value="9:55am-10:50am">9:55am-10:50am</option>
              <option value="11:10am-12:05pm">11:10am-12:05pm</option>
              <option value="12:05pm-1:00pm">12:05pm-1:00pm</option>
              <option value="2:00pm-3:00pm">2:00pm-3:00pm</option>
              <option value="3:00pm-4:00pm">3:00pm-4:00pm</option>
            </select>
          </div>
        </>
      )}

      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mt-2 p-2 border rounded"/>
      {loading && <p className="text-blue-600 mt-2">Uploading...</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default BulkUpload;
