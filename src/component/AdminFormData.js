import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminFormData() {
  const treeData = [
    {
      id: 1,
      name: "Main Member 1",
      age: 40,
      children: [
        { id: 101, name: "Child 1", age: 15 },
        { id: 102, name: "Child 2", age: 12 },
      ],
    },
    {
      id: 2,
      name: "Main Member 2",
      age: 45,
      children: [
        { id: 103, name: "Child 3", age: 18 },
        { id: 104, name: "Child 4", age: 10 },
      ],
    },
  ];

  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };


  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-900">Admin Panel</h2>
        <div className="space-x-3">
          <Link to="/formData">
            <button
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Add Form Data
            </button>
          </Link>
          <Link to="/">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border border-gray-300 bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Age</th>
            </tr>
          </thead>
          <tbody>
            {treeData.map((member) => (
              <React.Fragment key={member.id}>
                <tr className="bg-yellow-100">
                  <td
                    className="border px-4 py-2 cursor-pointer font-semibold"
                    onClick={() => toggleRow(member.id)}
                  >
                    {member.children?.length > 0 && (
                      <span className="mr-2">
                        {expandedRows[member.id] ? "▼" : "▶"}
                      </span>
                    )}
                    {member.name}
                  </td>
                  <td className="border px-4 py-2">{member.age}</td>
                </tr>

                {expandedRows[member.id] &&
                  member.children?.map((child) => (
                    <tr key={child.id} className="bg-white">
                      <td className="border px-4 py-2 pl-8">↳ {child.name}</td>
                      <td className="border px-4 py-2">{child.age}</td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
