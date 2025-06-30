import React, { useEffect, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { baseUrl } from "../utils/url";
import { Link } from "react-router-dom";
import { MdOutlineKeyboardDoubleArrowRight, MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import Swal from "sweetalert2";
import FormData from "./FormData";

export default function AdminFormData() {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [defaultColDef] = useState({ sortable: true, filter: true, resizable: true, minWidth: 120 });
  const [gridApi, setGridApi] = useState(null);
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
  const [totals, setTotals] = useState(null);
  const originalDataMapRef = useRef({});

  const [editRowData, setEditRowData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
const [forgotEmail, setForgotEmail] = useState("");
const [forgotPassword, setForgotPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [loading, setLoading] = useState(false);

const [showPassword, setShowPassword] = useState(false);




  const fetchData = async () => {
    try {
      const res = await fetch(`${baseUrl}/users/get-yajman-yadi`);
      const json = await res.json();
      const data = json.data;
      const total = json.total;
      setTotals(total);

      const flatRows = [];
      const fieldSet = new Set();

      data.forEach((parent) => {
        const parentId = parent.id;
        flatRows.push({ ...parent, id: parentId, isParent: true, expanded: false, hidden: false });

        Object.keys(parent).forEach((k) => {
          if (k !== "children") fieldSet.add(k);
        });

        parent.children?.forEach((child) => {
          flatRows.push({ ...child, id: child.id, parentId: parentId, isParent: false, hidden: true });
          Object.keys(child).forEach((k) => fieldSet.add(k));
        });
      });

      const fields = Array.from(fieldSet);

      const dynamicColumns = [
        {
          headerName: "",
          field: "expand",
          width: 20,
  pinned: "left",

          suppressMenu: true,
          suppressSorting: true,
          cellRenderer: (params) => {
            const data = params.data;
            if (data?.isParent) {
              return (
                <button onClick={() => toggleExpand(data.id)} style={{ fontSize: 14, background: "none", border: "none", cursor: "pointer" }}>
                  {data.expanded ? <MdOutlineKeyboardDoubleArrowDown /> : <MdOutlineKeyboardDoubleArrowRight />}
                </button>
              );
            } else {
              return <span style={{ marginLeft: 14 }}>↳</span>;
            }
          },
        },
         {
  headerName: "Actions",
  field: "actions",
  width: 80,
  pinned: "right",
  cellRenderer: (params) => {
    const data = params.data;

    // ✅ Avoid rendering Delete for pinned total row
    if (params.node.rowPinned) return null;

    return (
      <button
        onClick={() => handleDelete(data)}
        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
      >
        Delete
      </button>
    );
  },
},


        ...fields.map((key) => ({
          headerName: key.replace(/_/g, " ").toUpperCase(),
          field: key,
          flex: 1,
          editable: false,
          filter: true,
          sortable: true,
          cellClass: (params) => (params.node.rowPinned === "bottom" ? "font-bold bg-yellow-100" : ""),
          cellStyle: (params) => (params.data?.isParent ? { backgroundColor: "#FFF7D6", fontWeight: "bold" } : {}),
          valueFormatter: (params) =>
            key.includes("date") && params.value ? new Date(params.value).toLocaleDateString("en-IN") : params.value,
        })),
      ];

      setColumnDefs(dynamicColumns);
      setRowData(flatRows);
      updatePinnedTotals(flatRows.filter((r) => r.isParent));

      const originalMap = {};
      flatRows.forEach((row) => {
        originalMap[String(row.id)] = { ...row };
      });
      originalDataMapRef.current = originalMap;
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (row) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This will mark the entry as deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (!confirm.isConfirmed) return;

  setLoading(true);

  const payload = {
    type: row.isParent ? "main_member" : "member",
    is_deleted: 1,
    id: row.isParent ? row.id : row.id,
    yajman_id: row.isParent ? null : row.yajman_id,
  };

  try {
    const res = await fetch(`${baseUrl}/users/delete-yajman-yadi`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.message.includes("Deleted Successfully")){
  Swal.fire("Deleted!", json.message, "success");
  fetchData();
} else {
  Swal.fire("Error", json.message || "Delete failed", "error");
}

  } catch (err) {
    console.error("Delete error:", err);
    Swal.fire("Error", "Something went wrong", "error");
  } finally {
  setLoading(false);
}
};




  const toggleExpand = (parentId) => {
    setRowData((prevData) => {
      const updated = prevData.map((row) => ({ ...row }));
      const parentIndex = updated.findIndex((row) => row.id === parentId);
      const parent = updated[parentIndex];
      parent.expanded = !parent.expanded;
      for (let i = 0; i < updated.length; i++) {
        if (updated[i].parentId === parentId) {
          updated[i].hidden = !parent.expanded;
        }
      }
      updatePinnedTotals(updated.filter((r) => r.isParent && !r.hidden));
      return updated;
    });
  };

  const updatePinnedTotals = (visibleParents) => {
    const totalMembers = visibleParents.reduce((sum, r) => sum + (parseInt(r.member_count) || 0), 0);
    const totalPending = visibleParents
      .filter((r) => r.payment_status?.toLowerCase() === "pending")
      .reduce((sum, r) => sum + (parseInt(r.total_amount) || 0), 0);
    const totalReceived = visibleParents
      .filter((r) => r.payment_status?.toLowerCase() === "received")
      .reduce((sum, r) => sum + (parseInt(r.total_amount) || 0), 0);

    setPinnedBottomRowData([
      {
        name: "Total",
        member_count: totalMembers,
        total_amount: totalPending + totalReceived,
        payment_status: "",
      },
    ]);
  };

 const handleFormUpdate = async (updatedPayload) => {
  const cleanPayload = {};
  for (const key in updatedPayload) {
    const value = updatedPayload[key];
    if (value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "")) {
      cleanPayload[key] = value;
    }
  }

  setLoading(true);
  try {
    const res = await fetch(`${baseUrl}/users/update-yajman-yadi`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanPayload),
    });
    const result = await res.json();
    Swal.fire("Updated", "Data updated successfully", "success");
    setShowEditForm(false);
    fetchData();
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Update failed", "error");
  } finally {
    setLoading(false);
  }
};




  const handleRowDoubleClick = async (event) => {
  const fullRow = event.data;

  if (!fullRow.isParent) return;

  try {
    const res = await fetch(`${baseUrl}/users/get-one-yajman-yadi/${fullRow.id}`);
    const json = await res.json();

    const parent = json.data[0];

    if (parent) {
      const members = [];

      // Main member (from main_member field)
      members.push({
        member_id: parent.member_id,
        fullName: parent.name,
        age: parent.age,
        mobile: parent.mobile,
        gender: parent.gender,
        aadhaar: parent.aadhaar,
      });

      // Children
      if (Array.isArray(parent.children)) {
        parent.children.forEach((child) => {
          members.push({
            id: child.id,
            fullName: child.name,
            age: child.age,
            mobile: child.mobile,
            gender: child.gender,
            aadhaar: child.aadhaar,
          });
        });
      }

      const payload = {
        memberCount: members.length,
        members,
        department: parent.department,
        address: parent.address,
        city: parent.city,
        village: parent.village,
        refName: parent.ref_name,
        refMobile: parent.ref_mobile,
        refCity: parent.ref_city,
        totalAmount: parent.total_amount,
        paymentStatus: parent.payment_status,
        paymentDate: parent.payment_date,
        slipNo: parent.slip_no,
        yajman_id: parent.id,
        id: parent.id,
      };

      setEditRowData(payload);
      setShowEditForm(true);
    } else {
      Swal.fire("Error", "No data found", "error");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    Swal.fire("Error", "Something went wrong", "error");
  }
};

const handleForgotPasswordSubmit = async () => {
  if (!forgotEmail || !forgotPassword || !confirmPassword) {
    Swal.fire("Validation Error", "All fields are required.", "warning");
    return;
  }

  if (forgotPassword !== confirmPassword) {
    Swal.fire("Mismatch", "Passwords do not match.", "error");
    return;
  }
setLoading(true);
  try {
    const res = await fetch(`${baseUrl}/users/admin-forgot-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail, password_hash: forgotPassword , confirmPassword: confirmPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      Swal.fire("Success", data.message || "Password updated", "success");
      setShowForgotModal(false);
      setForgotEmail("");
      setForgotPassword("");
      setConfirmPassword("");
    } else {
      Swal.fire("Error", data.message || "Failed to reset password", "error");
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    Swal.fire("Error", "Server error occurred", "error");
  } finally {
  setLoading(false);
}
};





  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen w-full">

      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start mb-6">

        <h1 className="text-3xl font-bold text-yellow-700">Yajman Yadi</h1>
        <div className="flex flex-wrap gap-3">
          {totals && (
            <>
              <div className="bg-yellow-600 text-white px-4 py-2 rounded shadow">Yajman Group: {totals.total_yajman_group}</div>
              <div className="bg-yellow-600 text-white px-4 py-2 rounded shadow">Total Members: {totals.total_members}</div>
              <div className="bg-yellow-600 text-white px-4 py-2 rounded shadow">Pending Amount: ₹{totals.total_pending_amount}</div>
              <div className="bg-yellow-600 text-white px-4 py-2 rounded shadow">Received Amount: ₹{totals.total_received_amount}</div>


            </>
          )}
          <Link to="/formData">
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded shadow">Add Data</button>
          </Link>
              <button className="bg-blue-600  text-white px-4 py-2 rounded shadow"onClick={() => setShowForgotModal(true)}> Forgot Password </button>

          <Link to="/signup">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded shadow">Sign Up</button>
          </Link>
          <Link to="/">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow">Logout</button>
          </Link>
        </div>
      </div>

      <div className="ag-theme-alpine border border-gray-200" style={{ height: "88vh", width: "100%" }}>
        <AgGridReact
  onGridReady={(params) => setGridApi(params.api)}
  onRowDoubleClicked={handleRowDoubleClick}
  rowData={rowData.filter((row) => !row.hidden)}
  columnDefs={columnDefs}
  defaultColDef={defaultColDef}
  pinnedBottomRowData={pinnedBottomRowData}
  suppressRowClickSelection={true}
  onFilterChanged={() => {
    if (!gridApi) return;
    const visibleRows = [];
    gridApi.forEachNodeAfterFilter((node) => {
      if (node.data?.isParent && !node.data.hidden) {
        visibleRows.push(node.data);
      }
    });
    updatePinnedTotals(visibleRows);
  }}
/>

      </div>

      {showEditForm && (
        <FormData
          isEdit={true}
          initialData={editRowData}
          onClose={() => setShowEditForm(false)}
          onSubmit={handleFormUpdate}
        />
      )}
      {showForgotModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-center">Reset Admin Password</h2>

      <div className="mb-3">
        <label className="block mb-1">Email</label>
        <input
          type="email"
          className="w-full border border-gray-300 p-2 rounded"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1">New Password</label>
        <input
  type={showPassword ? "text" : "password"}
  className="w-full border border-gray-300 p-2 rounded"
  value={forgotPassword}
  onChange={(e) => setForgotPassword(e.target.value)}
/>

      </div>

      <div className="mb-4">
        <label className="block mb-1">Confirm Password</label>
        <input
  type={showPassword ? "text" : "password"}
  className="w-full border border-gray-300 p-2 rounded"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
/>
<div className="mb-4 text-right">
  <button
    type="button"
    className="text-sm text-blue-600 hover:underline"
    onClick={() => setShowPassword((prev) => !prev)}
  >
    {showPassword ? "Hide Password" : "Show Password"}
  </button>
</div>

      </div>

      <div className="flex justify-end gap-2">
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() => setShowForgotModal(false)}
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handleForgotPasswordSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}

{loading && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
    <div className="text-white text-xl bg-yellow-600 px-6 py-3 rounded shadow-lg animate-pulse">
      Processing...
    </div>
  </div>
)}


    </div>
  );
}
