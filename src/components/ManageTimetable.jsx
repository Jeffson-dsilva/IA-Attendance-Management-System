import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const ManageTimetable = () => {
  const [timetable, setTimetable] = useState({ subject: "", day: "", time: "" });

  const handleAddTimetable = async () => {
    await addDoc(collection(db, "timetable"), timetable);
    setTimetable({ subject: "", day: "", time: "" });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Manage Timetable</h2>
      <input type="text" placeholder="Subject" className="border p-2 m-2" value={timetable.subject} onChange={(e) => setTimetable({ ...timetable, subject: e.target.value })} />
      <input type="text" placeholder="Day" className="border p-2 m-2" value={timetable.day} onChange={(e) => setTimetable({ ...timetable, day: e.target.value })} />
      <input type="text" placeholder="Time" className="border p-2 m-2" value={timetable.time} onChange={(e) => setTimetable({ ...timetable, time: e.target.value })} />
      <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleAddTimetable}>
        Add Timetable
      </button>
    </div>
  );
};

export default ManageTimetable;
