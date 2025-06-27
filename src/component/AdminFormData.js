import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { baseUrl } from "../utils/url";

export default function AdminFormData() {
  const [treeData, setTreeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [filters, setFilters] = useState({
    name: "",
    age: "",
    gender: "",
    aadhaar: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(true);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseUrl}/users/get-yajman-yadi`);
        const data = await res.json();
        setTreeData(data);
        setFilteredData(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, treeData]);

  const applyFilters = () => {
    const match = (field, value) =>
      !filters[field] ||
      String(value || "").toLowerCase().includes(filters[field].toLowerCase());

    const filtered = treeData.filter((member) => {
      const parentMatch =
        match("name", member.name) &&
        match("age", member.age) &&
        match("gender", member.gender) &&
        match("aadhaar", member.aadhaar) &&
        match("mobile", member.mobile);

      const childMatches = member.children?.filter((child) =>
        match("name", child.name) &&
        match("age", child.age) &&
        match("gender", child.gender) &&
        match("aadhaar", child.aadhaar) &&
        match("mobile", child.mobile)
      );

      return parentMatch || (childMatches && childMatches.length > 0);
    });

    setFilteredData(filtered);
  };

  const handleInputChange = (id, field, value, isChild = false, parentId = null) => {
    const updated = treeData.map((member) => {
      if (member.id === id && !isChild) {
        return { ...member, [field]: value };
      }
      if (isChild && member.id === parentId) {
        const updatedChildren = member.children.map((child) =>
          child.id === id ? { ...child, [field]: value } : child
        );
        return { ...member, children: updatedChildren };
      }
      return member;
    });
    setTreeData(updated);
  };

  const renderEditableCell = (id, field, value, isChild, parentId, inputType = "text") => {
    if (inputType === "select") {
      return (
        <select
          className="p-1 border rounded w-full"
          value={value}
          onChange={(e) =>
            handleInputChange(id, field, e.target.value, isChild, parentId)
          }
        >
          <option>Male</option>
          <option>Female</option>
        </select>
      );
    }
    return (
      <input
        type={inputType}
        className="w-full p-1 border rounded"
        value={value}
        onChange={(e) =>
          handleInputChange(id, field, e.target.value, isChild, parentId)
        }
      />
    );
  };

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-900">Yajman Yadi List</h2>
        <div className="space-x-3">
          <Link to="/formData">
            <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
              Add Form Data
            </button>
          </Link>
          <Link to="/">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          </Link>
           <Link to="/signup">
          <span className="text-base cursor-pointer justify-center flex font-semibold text-yellow-800 mt-4 italic">
            Sign Up
          </span>
        </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <table className="table-auto w-full border border-gray-300 bg-white rounded shadow">
            <thead className="bg-yellow-200 text-gray-700">
              <tr>
                {Object.keys(filters).map((key) => (
                  <th key={key} className="px-4 py-2 text-left text-sm font-semibold">
                    <input
                      type="text"
                      placeholder={`Filter ${key}`}
                      value={filters[key]}
                      onChange={(e) =>
                        setFilters({ ...filters, [key]: e.target.value })
                      }
                      className="w-full p-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((member) => (
                <React.Fragment key={member.id}>
                  <tr className="bg-yellow-100">
                    <td
                      className="border px-4 py-2 font-semibold cursor-pointer"
                      onClick={() => toggleRow(member.id)}
                    >
                      {member.children?.length > 0 && (
                        <span className="mr-2">
                          {expandedRows[member.id] ? "▼" : "▶"}
                        </span>
                      )}
                      {renderEditableCell(member.id, "name", member.name, false)}
                    </td>
                    <td className="border px-4 py-2">
                      {renderEditableCell(member.id, "age", member.age, false)}
                    </td>
                    <td className="border px-4 py-2">
                      {renderEditableCell(member.id, "gender", member.gender, false, null, "select")}
                    </td>
                    <td className="border px-4 py-2">
                      {renderEditableCell(member.id, "aadhaar", member.aadhaar, false)}
                    </td>
                    <td className="border px-4 py-2">
                      {renderEditableCell(member.id, "mobile", member.mobile, false)}
                    </td>
                  </tr>
                  {expandedRows[member.id] &&
                    member.children?.map((child) => (
                      <tr key={child.id} className="bg-white">
                        <td className="border px-4 py-2 pl-8">
                          ↳ {renderEditableCell(child.id, "name", child.name, true, member.id)}
                        </td>
                        <td className="border px-4 py-2">
                          {renderEditableCell(child.id, "age", child.age, true, member.id)}
                        </td>
                        <td className="border px-4 py-2">
                          {renderEditableCell(child.id, "gender", child.gender, true, member.id, "select")}
                        </td>
                        <td className="border px-4 py-2">
                          {renderEditableCell(child.id, "aadhaar", child.aadhaar, true, member.id)}
                        </td>
                        <td className="border px-4 py-2">
                          {renderEditableCell(child.id, "mobile", child.mobile, true, member.id)}
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}