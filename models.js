const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    uname: String,
    email: String,
    password: String,
    role: String, // student, faculty, hod
    usn: { type: String, default: null }, // Only for students
    assignedSubjects: { type: [String], default: [] }, // ✅ Multiple subjects for faculty
    assignedClass: { type: String, default: null }, // ✅ Class (A/B)
    department: { type: String, default: null }, // ✅ Department
});


// Attendance Schema (Linked to Faculty and Subject)
const AttendanceSchema = new mongoose.Schema({
    usn: { type: String, required: true },
    date: { type: String, required: true },
    hour: { type: String, required: true },
    subject: { type: String, required: true },
    facultyEmail: { type: String, required: true },
    status: { type: String, enum: ["present", "absent"], required: true }, // ✅ Limited status values
});

// IA Marks Schema (Linked to Faculty and Subject)
const IAMarksSchema = new mongoose.Schema({
    usn: { type: String, required: true },
    subject: { type: String, required: true },
    facultyEmail: { type: String, required: true },
    IA1: { type: Number, min: 0, max: 50, default: 0 }, // ✅ Added min constraint
    IA2: { type: Number, min: 0, max: 50, default: 0 }, // ✅ Added min constraint
});

module.exports = {
    User: mongoose.model("User", UserSchema),
    Attendance: mongoose.model("Attendance", AttendanceSchema),
    IAMarks: mongoose.model("IAMarks", IAMarksSchema),
};
