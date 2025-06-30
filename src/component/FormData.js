import React, { useState, useEffect } from "react";
import { baseUrl } from "../utils/url";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function FormData({
  initialData = {},
  onClose,
  onSubmit,
  isEdit = false,
}) {
  const [memberCount, setMemberCount] = useState(initialData.memberCount || 0);
  const [members, setMembers] = useState(initialData.members || []);
  const [paymentDate, setPaymentDate] = useState(
    () => initialData.paymentDate || new Date().toISOString().slice(0, 10)
  );
  const [department, setDepartment] = useState(initialData.department || "");
  const [totalAmount, setTotalAmount] = useState(initialData.totalAmount || "");
  const [perMemberAmount, setPerMemberAmount] = useState("");
  const [manualTotalAmount, setManualTotalAmount] = useState(
    initialData.totalAmount || ""
  );
  const [slipNo, setSlipNo] = useState(initialData.slipNo || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [paymentStatus, setPaymentStatus] = useState(
    initialData.paymentStatus || ""
  );

  const [city, setCity] = useState(initialData.city || "");
  const [village, setVillage] = useState(initialData.village || "");
  const [refName, setRefName] = useState(initialData.refName || "");
  const [refMobile, setRefMobile] = useState(initialData.refMobile || "");
  const [refCity, setRefCity] = useState(initialData.refCity || "");
  const [paymentRef, setPaymentRef] = useState(initialData.paymentRef || "");

  const blankMember = {
    fullName: "",
    age: "",
    aadhaar: "",
    mobile: "",
    gender: "",
  };

  useEffect(() => {
    if (members.length < memberCount) {
      const updated = [...members];
      while (updated.length < memberCount) {
        updated.push({ ...blankMember });
      }
      setMembers(updated);
    } else {
      setMembers((prev) => prev.slice(0, memberCount));
    }
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
    e?.preventDefault();

    const mainMember = members[0];
    const otherMembers = members.slice(1);

    const payload = {
      id: initialData?.id,
      yajman_id: initialData?.yajman_id,
      department,
      memberCount,
      mainMember,
      otherMembers,
      address,
      slipNo,
      totalAmount: department === "katha" ? totalAmount : manualTotalAmount,
      paymentDate: paymentStatus === "Pending" ? null : paymentDate,
      paymentStatus,
      paymentRef:
        e?.target?.["paymentRef"]?.value || initialData?.paymentRef || "",
      city: e?.target?.["city"]?.value || initialData?.city || "",
      village: e?.target?.["village"]?.value || initialData?.village || "",
      refName: e?.target?.["refName"]?.value || initialData?.refName || "",
      refMobile:
        e?.target?.["refMobile"]?.value || initialData?.refMobile || "",
      refCity: e?.target?.["refCity"]?.value || initialData?.refCity || "",
    };

    if (isEdit && onSubmit) {
      onSubmit(payload);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/users/add-yajman-yadi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Data Submitted Successfully",
        });

        // Reset form
        // Reset form values
setMemberCount(0);
setMembers([]);
setDepartment("");
setTotalAmount("");
setPerMemberAmount("");
setManualTotalAmount("");
setSlipNo("");
setAddress("");
setPaymentStatus("");
setPaymentDate(new Date().toISOString().slice(0, 10));

setCity("");
setVillage("");
setRefName("");
setRefMobile("");
setRefCity("");
setPaymentRef("");


      } else {
        Swal.fire({
          icon: "Error",
          title: "Data Submission Failed",
          text: data.message,
        });
      }
    } catch (error) {
      Swal.fire(
        "Error",
        "An error occurred while submitting the form",
        "error"
      );
    }
  };

  const handleAddMember = () => {
    setMembers((prev) => [...prev, { ...blankMember }]);
    setMemberCount((prev) => prev + 1);
  };

  const handleRemoveMember = (index) => {
    if (index === 0) return; // prevent removing main member
    setMembers((prev) => prev.filter((_, i) => i !== index));
    setMemberCount((prev) => prev - 1);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex w-full items-center  gap-2">
        <div className="w-full">
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
            readOnly
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={handleAddMember}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
          >
            + Add Member
          </button>
        </div>
      </div>

      {members.map((member, index) => (
        <div
          key={index}
          className="border rounded p-4 bg-yellow-50 mb-4 relative"
        >
          <h3 className="font-semibold text-yellow-800 mb-2">
            {index === 0 ? "Main Member" : `Member ${index}`}
          </h3>

          {/* Remove Button */}
          {index !== 0 && (
            <button
              type="button"
              onClick={() => handleRemoveMember(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              🗑
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <label className="block mb-1 font-medium text-yellow-900">
                Full Name
              </label>
              <input
                type="text"
                value={member.name || member.fullName || ""}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            value={refName}
            onChange={(e) => setRefName(e.target.value)}
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
            value={refCity}
            onChange={(e) => setRefCity(e.target.value)}
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
            value={refMobile}
            onChange={(e) => setRefMobile(e.target.value)}
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
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
            value={village}
            onChange={(e) => setVillage(e.target.value)}
          />
        </div>

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
              if (department !== "katha") setManualTotalAmount(e.target.value);
            }}
            readOnly={department === "katha"}
          />
        </div>
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
              setPaymentDate(
                value === "Pending" ? "" : new Date().toISOString().slice(0, 10)
              );
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
  value={paymentRef}
  onChange={(e) => setPaymentRef(e.target.value)}
  className="border rounded px-3 py-2 w-full"
/>

        </div>
      </div>

      <div className="text-center mt-6 flex-col flex gap-2 justify-center w-full">
        <button
          type="submit"
          className="bg-yellow-700 text-white px-6 py-2 w-full rounded hover:bg-yellow-800 transition"
        >
          {isEdit ? "Save Changes" : "Submit"}
        </button>
        {!isEdit && (
          <Link to="/adminformData">
            <button className="bg-yellow-700 text-white px-6 py-2 rounded w-full hover:bg-yellow-800 transition">
              Form Data
            </button>
          </Link>
        )}
      </div>
    </form>
  );

  return isEdit ? (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-6xl shadow-md border border-yellow-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-yellow-800">Edit Member</h2>
          <button onClick={onClose} className="text-red-500 text-lg">
            ✕
          </button>
        </div>
        {renderForm()}
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white p-6 rounded-xl shadow-md border border-yellow-300">
        <h2 className="text-2xl font-bold text-yellow-900 mb-6 text-center">
          Bhagvat Katha Yajman Form
        </h2>
        {renderForm()}
      </div>
    </div>
  );
}
