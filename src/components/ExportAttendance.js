const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const { Attendance } = require("./models");
const fs = require("fs");
const path = require("path");

// 📌 Export Attendance API
router.get("/export-attendance", async (req, res) => {
  try {
    // ✅ 1. Fetch Attendance Data
    const attendanceRecords = await Attendance.find();
    if (!attendanceRecords.length) {
      return res.status(404).json({ success: false, message: "No attendance records found!" });
    }

    // ✅ 2. Convert Data to Excel Format
    const worksheetData = attendanceRecords.map(record => ({
      Date: record.date,
      Hour: record.hour,
      Subject: record.subject,
      USN: record.usn,
      Attendance: record.status
    }));

    // ✅ 3. Create Excel Workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    // ✅ 4. Save Excel File Temporarily
    const exportPath = path.join(__dirname, "exports", "Attendance.xlsx");
    XLSX.writeFile(workbook, exportPath);

    // ✅ 5. Send File as Response
    res.download(exportPath, "Attendance.xlsx", (err) => {
      if (err) console.error("❌ Error sending file:", err);
      
      // 📌 Delete file after download
      fs.unlinkSync(exportPath);
    });

  } catch (error) {
    console.error("❌ Error exporting attendance:", error);
    res.status(500).json({ success: false, message: "Error exporting attendance", error: error.message });
  }
});

module.exports = router;
