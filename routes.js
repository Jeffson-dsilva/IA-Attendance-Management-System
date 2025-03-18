const mongoose = require("mongoose");

const express = require("express");
const bcrypt = require("bcryptjs");
const { User, Attendance, IAMarks } = require("./models");
const XLSX = require("xlsx");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { CourseFile } = require("./models");

const router = express.Router();

/**
 * ✅ Register User
 */
router.post("/register", async (req, res) => {
    try {
        const { uname, email, usn, role, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "User already exists!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ uname, email, usn, role, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ success: true, message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ✅ Login User
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ✅ Fetch User Details by Email
 */
router.get("/users/:email", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ✅ Upload Attendance (Avoids Duplicates)
 */
router.post("/upload-attendance", async (req, res) => {
    try {
        for (const record of req.body) {
            const existingRecord = await Attendance.findOne({
                usn: record.usn,
                date: record.date,
                hour: record.hour,
            });

            if (existingRecord) {
                await Attendance.updateOne(
                    { _id: existingRecord._id },
                    { $set: { status: record.status } }
                );
            } else {
                await Attendance.create(record);
            }
        }

        res.json({ success: true, message: "Attendance uploaded successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error uploading attendance", error: error.message });
    }
});

/**
 * ✅ Fetch Attendance by Date
 */
router.get("/attendance", async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) return res.status(400).json({ success: false, message: "Date is required" });

        const attendanceRecords = await Attendance.find({ date });

        const studentDetails = await User.find({}, "usn uname");
        const studentMap = {};
        studentDetails.forEach(student => {
            studentMap[student.usn] = student.uname;
        });

        const enrichedRecords = attendanceRecords.map(record => ({
            ...record._doc,
            uname: studentMap[record.usn] || "Unknown Student",
        }));

        res.json({ success: true, records: enrichedRecords });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ✅ Update Attendance Status
 */
router.put("/update-attendance", async (req, res) => {
    try {
        const { id, status } = req.body;

        if (!id || !status) return res.status(400).json({ success: false, message: "Missing required fields" });

        const updatedRecord = await Attendance.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedRecord) return res.status(404).json({ success: false, message: "Attendance record not found" });

        res.json({ success: true, message: "Attendance updated successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ✅ Upload IA Marks (Avoids Duplicates)
 */
router.post("/upload-ia-marks", async (req, res) => {
    try {
        for (const record of req.body) {
            const existingRecord = await IAMarks.findOne({
                usn: record.usn,
                subject: record.subject,
            });

            if (existingRecord) {
                await IAMarks.updateOne(
                    { _id: existingRecord._id },
                    { $set: { IA1: record.IA1, IA2: record.IA2 } }
                );
            } else {
                await IAMarks.create(record);
            }
        }

        res.json({ success: true, message: "IA Marks uploaded successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error uploading IA marks", error: error.message });
    }
});

/**
 * ✅ Fetch IA Marks (Supports USN Filtering)
 */
router.get("/ia-marks", async (req, res) => {
    try {
        const { usn } = req.query;
        const query = usn ? { usn } : {};
        const marksRecords = await IAMarks.find(query);

        const studentDetails = await User.find({}, "usn uname");
        const studentMap = {};
        studentDetails.forEach(student => {
            studentMap[student.usn] = student.uname;
        });

        const enrichedRecords = marksRecords.map(record => ({
            ...record._doc,
            uname: studentMap[record.usn] || "Unknown Student",
        }));

        res.json({ success: true, records: enrichedRecords });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put("/ia-marks/update", async (req, res) => {
    try {
        const { id, IA1, IA2, facultyEmail } = req.body; // Accept facultyEmail for validation

        if (!id || IA1 === undefined || IA2 === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Find the IA Marks record
        const record = await IAMarks.findById(id);
        if (!record) {
            return res.status(404).json({ success: false, message: "IA Marks record not found" });
        }

        // Check if the faculty updating is the one who originally entered the marks
        if (record.facultyEmail !== facultyEmail) {
            return res.status(403).json({ success: false, message: "Unauthorized: You can only update marks assigned by you" });
        }

        // Update IA Marks
        const updatedRecord = await IAMarks.findByIdAndUpdate(
            id,
            { $set: { IA1, IA2 } }, // ✅ Correct update using `$set`
            { new: true }
        );

        res.json({ success: true, message: "IA Marks updated successfully!", updatedRecord });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating IA Marks", error: error.message });
    }
});

/**
 * ✅ Export Attendance to Excel
 */
router.get("/generate-attendance-excel/:date/:hour/:subject", async (req, res) => {
    try {
        const { date, hour, subject } = req.params;
        const attendanceRecords = await Attendance.find({ date, hour, subject });

        if (attendanceRecords.length === 0) {
            return res.status(404).json({ success: false, message: "No attendance records found!" });
        }

        const excelData = [["Date", "Hour", "Subject", "USN", "Attendance"]];
        attendanceRecords.forEach(record => {
            excelData.push([record.date, record.hour, record.subject, record.usn, record.status]);
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        const filePath = path.join(__dirname, "exports", `Attendance_${date}_${hour}_${subject}.xlsx`);
        XLSX.writeFile(workbook, filePath);

        res.download(filePath, `Attendance_${date}_${hour}_${subject}.xlsx`, () => {
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ✅ Fetch Student Performance Analytics
 */
router.get("/student-performance", async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select("usn uname");
        const attendanceRecords = await Attendance.find({ status: "present" });
        const marksRecords = await IAMarks.find();

        let above85Attendance = students.filter(student =>
            (attendanceRecords.filter(a => a.usn === student.usn).length / attendanceRecords.length) * 100 >= 85
        ).length;

        let above25Marks = marksRecords.filter(record => record.IA1 > 25 || record.IA2 > 25).length;

        res.json({ success: true, above85Attendance, above25Marks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});





// ✅ Fetch Faculty Data
router.get("/faculty", async (req, res) => {
    try {
        const facultyRecords = await User.find({ role: "faculty" });
        res.json({ success: true, records: facultyRecords });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching faculty", error: error.message });
    }
});

router.put("/faculty/assign-subject", async (req, res) => {
    try {
        const { facultyId, subjects, assignedClass } = req.body;

        // Validate input
        if (!facultyId || !Array.isArray(subjects) || subjects.length === 0 || !assignedClass) {
            return res.status(400).json({ success: false, message: "All fields are required, and subjects must be an array!" });
        }

        // Update faculty record
        const updatedFaculty = await User.findByIdAndUpdate(
            facultyId,
            { 
                $set: {
                    assignedSubjects: subjects, // ✅ Save subjects array
                    assignedClass, // ✅ Save assigned class (A/B)
                }
            },
            { new: true } // ✅ Return updated document
        );

        if (!updatedFaculty) {
            return res.status(404).json({ success: false, message: "Faculty not found!" });
        }

        res.json({ success: true, message: "Subjects & Class assigned successfully!", faculty: updatedFaculty });
    } catch (error) {
        console.error("❌ Error assigning subjects:", error);
        res.status(500).json({ success: false, message: "Error assigning subjects", error: error.message });
    }
});


router.delete("/faculty/remove/:id", async (req, res) => {
    try {
        // Check if faculty exists
        const faculty = await User.findById(req.params.id);
        if (!faculty) {
            return res.status(404).json({ success: false, message: "Faculty not found!" });
        }

        // Optional: Remove linked records if needed (e.g., attendance, marks)
        await Attendance.deleteMany({ facultyEmail: faculty.email });
        await IAMarks.deleteMany({ facultyEmail: faculty.email });

        // Remove faculty
        await User.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "Faculty removed successfully!" });
    } catch (error) {
        console.error("❌ Error removing faculty:", error);
        res.status(500).json({ success: false, message: "Error deleting faculty", error: error.message });
    }
});

router.get("/students", async (req, res) => {
    try {
        const { subject } = req.query; // ✅ Get subject filter from frontend

        // ✅ Fetch all students, attendance, and IA records
        const userStudents = await User.find({ role: "student" }).select("usn uname assignedClass");
        const attendanceRecords = await Attendance.find(subject ? { subject } : {}).select("usn subject status");
        const iaRecords = await IAMarks.find(subject ? { subject } : {}).select("usn subject IA1 IA2");

        // ✅ Get unique USNs from all collections
        const uniqueUSNs = new Set([
            ...userStudents.map(s => s.usn),
            ...attendanceRecords.map(a => a.usn),
            ...iaRecords.map(i => i.usn)
        ]);

        let studentsWithPerformance = [];

        for (const usn of [...uniqueUSNs].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
            // Fetch student details
            const studentData = userStudents.find(s => s.usn === usn) || {};
            const studentAttendance = attendanceRecords.filter(a => a.usn === usn);
            const iaData = iaRecords.find(i => i.usn === usn) || { IA1: 0, IA2: 0 };

            // ✅ Calculate Attendance Percentage for selected subject
            const totalAttendanceRecords = studentAttendance.length;
            const totalPresents = studentAttendance.filter(a => a.status && a.status.toLowerCase() === "present").length;
            const attendancePercentage = totalAttendanceRecords > 0 ? ((totalPresents / totalAttendanceRecords) * 100).toFixed(2) : "0.00";

            studentsWithPerformance.push({
                usn,
                uname: studentData.uname || `Student ${usn}`,
                assignedClass: studentData.assignedClass || (parseInt(usn.slice(-3)) <= 60 ? "A" : "B"), // ✅ Assign class dynamically
                attendancePercentage,
                IA1: iaData.IA1 || 0,
                IA2: iaData.IA2 || 0
            });
        }

        res.json({ success: true, records: studentsWithPerformance });
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get("/analytics", async (req, res) => {
    try {
        const { subject } = req.query;
        
        if (!subject) {
            return res.status(400).json({ success: false, message: "Subject is required!" });
        }

        console.log(`🔍 Fetching analytics for subject: ${subject}`);

        // Fetch IA Marks
        const iaRecords = await IAMarks.find({ subject }).lean();
        const above25 = iaRecords.filter(record => record.IA1 > 25 || record.IA2 > 25).length;
        const below25 = iaRecords.length - above25;

        // Fetch Attendance
        const attendanceRecords = await Attendance.find({ subject }).lean();
        
        if (attendanceRecords.length === 0) {
            return res.json({
                success: true,
                iaDistribution: { above25, below25 },
                attendanceDistribution: { above85: 0, below85: 0 },
            });
        }

        // Group attendance by USN
        const attendanceByStudent = {};
        attendanceRecords.forEach(record => {
            if (!attendanceByStudent[record.usn]) {
                attendanceByStudent[record.usn] = { total: 0, present: 0 };
            }
            attendanceByStudent[record.usn].total += 1;
            if (record.status && record.status.toLowerCase() === "present") {
                attendanceByStudent[record.usn].present += 1;
            }
        });

        // Calculate percentages and categorize students
        let above85 = 0, below85 = 0;
        Object.values(attendanceByStudent).forEach(student => {
            const attendancePercentage = (student.present / student.total) * 100;
            if (attendancePercentage >= 85) {
                above85 += 1;
            } else {
                below85 += 1;
            }
        });

        res.json({
            success: true,
            iaDistribution: { above25, below25 },
            attendanceDistribution: { above85, below85 },
        });

    } catch (error) {
        console.error("❌ Error fetching analytics:", error);
        res.status(500).json({ success: false, message: "Error fetching analytics", error: error.message });
    }
});

router.get("/student-attendance", async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: "Student email is required!" });
        }

        // Fetch student details using email
        const student = await User.findOne({ email });
        if (!student || !student.usn) {
            return res.status(404).json({ success: false, message: "Student not found!" });
        }

        // Fetch Attendance using the student's USN
        const attendanceRecords = await Attendance.find({ usn: student.usn });

        // Fetch Faculty Emails assigned to subjects
        const facultyRecords = await User.find({ role: "faculty" });
        const facultyMap = {};
        facultyRecords.forEach((fac) => {
            (fac.assignedSubjects || []).forEach((subj) => {
                facultyMap[subj] = fac.uname; // Store faculty name against subject
            });
        });

        // Add Faculty Name to Attendance Records
        const enrichedRecords = attendanceRecords.map((record) => ({
            ...record._doc,
            facultyName: facultyMap[record.subject] || "N/A", // Assign faculty name or "N/A"
        }));

        // Calculate Attendance Percentage
        const subjectWiseAttendance = {};
        attendanceRecords.forEach((record) => {
            if (!subjectWiseAttendance[record.subject]) {
                subjectWiseAttendance[record.subject] = { present: 0, total: 0 };
            }
            subjectWiseAttendance[record.subject].total++;
            if (record.status === "Present") {
                subjectWiseAttendance[record.subject].present++;
            }
        });

        const subjectAttendance = Object.keys(subjectWiseAttendance).map((subject) => ({
            subject,
            percentage: ((subjectWiseAttendance[subject].present / subjectWiseAttendance[subject].total) * 100).toFixed(2),
        }));

        res.json({ success: true, subjectAttendance, attendanceRecords: enrichedRecords });
    } catch (error) {
        console.error("❌ Error fetching attendance:", error);
        res.status(500).json({ success: false, message: "Error fetching attendance", error: error.message });
    }
});



router.get("/student-ia-marks", async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: "Student email is required!" });
        }

        // Fetch student details using email
        const student = await User.findOne({ email });
        if (!student || !student.usn) {
            return res.status(404).json({ success: false, message: "Student not found!" });
        }

        // Fetch IA Marks using the student's USN
        const marksRecords = await IAMarks.find({ usn: student.usn });

        res.json({ success: true, records: marksRecords });
    } catch (error) {
        console.error("❌ Error fetching IA Marks:", error);
        res.status(500).json({ success: false, message: "Error fetching IA Marks", error: error.message });
    }
});

module.exports = router;
