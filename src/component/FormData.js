import React, { useState, useEffect } from "react";
import { baseUrl } from "../utils/url";

export default function FormData() {
  const [memberCount, setMemberCount] = useState(0);
  const [members, setMembers] = useState([]);
  const [paymentDate, setPaymentDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [department, setDepartment] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [perMemberAmount, setPerMemberAmount] = useState("");
  const [manualTotalAmount, setManualTotalAmount] = useState("");
  const [slipNo, setSlipNo] = useState("");
  const [address, setAddress] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const blankMember = {
    fullName: "",
    age: "",
    aadhaar: "",
    mobile: "",
    gender: "",
  };

  useEffect(() => {
    setMembers((prev) => {
      const updated = [...prev];
      while (updated.length < memberCount) {
        updated.push({ ...blankMember });
      }
      return updated.slice(0, memberCount);
    });
  }, [memberCount]);

  const handleMemberChange = (index, field, value) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleCountChange = (e) => {
    const count = parseInt(e.target.value);
    const safeCount = isNaN(count) ? 0 : count;
    setMemberCount(safeCount);

    if (department === "katha" && safeCount > 0) {
      const total = safeCount * 3000;
      setTotalAmount(total.toString());
      setPerMemberAmount("3000");
    } else {
      setTotalAmount("");
      setPerMemberAmount("");
    }
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setDepartment(value);

    if (value === "katha" && memberCount > 0) {
      const total = memberCount * 3000;
      setTotalAmount(total.toString());
      setPerMemberAmount("3000");
    } else {
      setTotalAmount("");
      setPerMemberAmount("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mainMember = members[0];
    const otherMembers = members.slice(1);

    const payload = {
      department,
      memberCount,
      mainMember,
      otherMembers,
      address,
      slipNo,
      totalAmount: department === "katha" ? totalAmount : manualTotalAmount,
      paymentDate: paymentStatus === "Pending" ? null : paymentDate,
      paymentStatus,
      paymentRef: e.target["paymentRef"].value,
      city: e.target["city"].value,
      village: e.target["village"].value,
      refName: e.target["refName"].value,
      refMobile: e.target["refMobile"].value,
      refCity: e.target["refCity"].value,
    };

    try {
      const response = await fetch(`${baseUrl}/users/add-yajman-yadi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Form submitted successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white p-6 rounded-xl shadow-md border border-yellow-300">
        <h2 className="text-2xl font-bold text-yellow-900 mb-6 text-center">
          Bhagvat Katha Yajman Form
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="memberCount"
              className="block mb-1 font-medium text-yellow-900"
            >
              Members
            </label>
            <input
              id="memberCount"
              type="number"
              value={memberCount}
              onChange={handleCountChange}
              min="0"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          {members.map((member, index) => (
            <div key={index} className="border rounded p-4 bg-yellow-50 mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                {index === 0 ? "Main Member" : `Member ${index}`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-yellow-900">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={member.fullName || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "fullName", e.target.value)
                    }
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-yellow-900">
                    Age
                  </label>
                  <input
                    type="number"
                    value={member.age || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "age", e.target.value)
                    }
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-yellow-900">
                    Aadhaar No
                  </label>
                  <input
                    type="text"
                    value={member.aadhaar || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "aadhaar", e.target.value)
                    }
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-yellow-900">
                    Mobile No
                  </label>
                  <input
                    type="text"
                    value={member.mobile || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "mobile", e.target.value)
                    }
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-yellow-900">
                    Gender
                  </label>
                  <select
                    value={member.gender || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "gender", e.target.value)
                    }
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Static Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="address"
                className="block mb-1 font-medium text-yellow-900"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className="block mb-1 font-medium text-yellow-900"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label
                htmlFor="village"
                className="block mb-1 font-medium text-yellow-900"
              >
                Village
              </label>
              <input
                id="village"
                name="village"
                type="text"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label
                htmlFor="department"
                className="block mb-1 font-medium text-yellow-900"
              >
                Department
              </label>
              <select
                id="department"
                value={department}
                onChange={handleDepartmentChange}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">Select Department</option>
                <option value="main_yajman">Main Yajman</option>
                <option value="yajman">Yajman</option>
                <option value="yagna">Yagna</option>
                <option value="katha">Katha</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="refName"
                className="block mb-1 font-medium text-yellow-900"
              >
                Ref Name
              </label>
              <input
                id="refName"
                name="refName"
                type="text"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label
                htmlFor="refMobile"
                className="block mb-1 font-medium text-yellow-900"
              >
                Ref Mobile No
              </label>
              <input
                id="refMobile"
                name="refMobile"
                type="text"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label
                htmlFor="refCity"
                className="block mb-1 font-medium text-yellow-900"
              >
                Ref City
              </label>
              <input
                id="refCity"
                name="refCity"
                type="text"
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div>
              <label
                htmlFor="slipNo"
                className="block mb-1 font-medium text-yellow-900"
              >
                Slip No
              </label>
              <input
                id="slipNo"
                type="text"
                value={slipNo}
                onChange={(e) => setSlipNo(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-yellow-900">
                Total Amount
              </label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={department === "katha" ? totalAmount : manualTotalAmount}
                onChange={(e) => {
                  if (department !== "katha") {
                    setManualTotalAmount(e.target.value);
                  }
                }}
                readOnly={department === "katha"}
              />
            </div>

            {/* Member Fields */}

            {/* Final Fields */}

            <div>
              <label className="block mb-1 font-medium text-yellow-900">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                className="border rounded px-3 py-2 w-full"
                value={paymentStatus}
                onChange={(e) => {
                  const value = e.target.value;
                  setPaymentStatus(value);
                  if (value === "Pending") {
                    setPaymentDate(""); // Clear date input if pending
                  } else {
                    setPaymentDate(new Date().toISOString().slice(0, 10)); // Default to today if paid
                  }
                }}
              >
                <option value="">Select</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-yellow-900">
                Payment Date
              </label>
              <input
                type="date"
                className="border rounded px-3 py-2 w-full"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-yellow-900">
                Payment Ref
              </label>
              <input
                type="text"
                name="paymentRef"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              type="submit"
              className="bg-yellow-700 text-white px-6 py-2 rounded hover:bg-yellow-800 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
