import React from "react";

const timetableData = [
  { day: "Monday", slots: ["C#.NET", "AWT", "NoSQL", "", "", "CN Lab-A1/AWT Lab-A2", "INT"] },
  { day: "Tuesday", slots: ["AWT", "NoSQL", "IOT", "C#.NET", "", "", ""] },
  { day: "Wednesday", slots: ["IOT", "C#.NET", "CN", "AWT", "", "CN.NET Lab-A1/CN Lab-A2", ""] },
  { day: "Thursday", slots: ["C#.NET", "CN", "", "", "", "", "Project Phase-I"] },
  { day: "Friday", slots: ["CN", "AWT Lab-A1/C#.NET Lab-A2", "", "", "", "NoSQL", ""] },
  { day: "Saturday", slots: ["", "", "", "", "", "", ""] }
];

const subjects = [
  { abbr: "AWT", code: "23MCA301", title: "Advances in Web Technologies", faculty: "Dr. Hareesh B", venue: "1412" },
  { abbr: "C#.NET", code: "23MCA302", title: "Programming using C#.NET", faculty: "Ms. Sumangala N", venue: "1412" },
  { abbr: "CN", code: "23MCA303", title: "Computer Networks", faculty: "Ms. Rakshitha P", venue: "1412" },
  { abbr: "NoSQL", code: "23MCA304", title: "NoSQL", faculty: "Ms. Rakshitha P", venue: "1412" },
  { abbr: "IOT", code: "23MCA305", title: "Internet of Things", faculty: "Mr. Murari B K", venue: "1412" },
  { abbr: "AWT Lab", code: "23MCL306", title: "Advances in Web Technologies Lab", faculty: "Dr. Hareesh B", venue: "MCA Lab(A2)" },
  { abbr: "CN.NET Lab", code: "23MCL307", title: "Programming using C#.NET Lab", faculty: "Ms. Sumangala N", venue: "MCA Lab(A1)" },
  { abbr: "CN Lab", code: "23MCL308", title: "Computer Network Laboratory", faculty: "Ms. Rakshitha P", venue: "MCA Lab(A2)" },
  { abbr: "INT", code: "23INT309", title: "Summer Internship - I", faculty: "Mr. Brill Brenhill", venue: "MCA Lab(A4)" }
];

const TimetablePage = () => {
  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Timetable - III Semester MCA (A Section)</h2>

      {/* Timetable Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-gray-100 shadow-md rounded text-center">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="p-2">Day</th>
              <th className="p-2">9:00-9:55</th>
              <th className="p-2">9:55-10:50</th>
              <th className="p-2">11:10-12:05</th>
              <th className="p-2">12:05-1:00</th>
              <th className="p-2">2:00-3:00</th>
              <th className="p-2">3:00-4:00</th>
              <th className="p-2">4:00-5:00</th>
            </tr>
          </thead>
          <tbody>
            {timetableData.map((row, index) => (
              <tr key={index} className="border-t">
                <td className="p-2 font-semibold bg-gray-200">{row.day}</td>
                {row.slots.map((slot, i) => (
                  <td key={i} className="p-2">{slot || "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subjects Table */}
      <h3 className="text-lg font-semibold text-blue-700 mb-3">Subject Details</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-100 shadow-md rounded text-center">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="p-2">Abbreviation</th>
              <th className="p-2">Subject Code</th>
              <th className="p-2">Title</th>
              <th className="p-2">Faculty</th>
              <th className="p-2">Venue</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <tr key={index} className="border-t">
                <td className="p-2 font-semibold">{subject.abbr}</td>
                <td className="p-2">{subject.code}</td>
                <td className="p-2">{subject.title}</td>
                <td className="p-2">{subject.faculty}</td>
                <td className="p-2">{subject.venue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetablePage;
