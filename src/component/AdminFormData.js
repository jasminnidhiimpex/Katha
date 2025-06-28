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
  const [defaultColDef] = useState({ sortable: true, filter: true, resizable: true, minWidth: 80 });
  const [gridApi, setGridApi] = useState(null);
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
  const [totals, setTotals] = useState(null);
  const originalDataMapRef = useRef({});

  const [editRowData, setEditRowData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

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
          width: 30,
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

 const handleFormUpdate = (updatedPayload) => {
  // Clean out null/empty/blank fields from payload
  const cleanPayload = {};
  for (const key in updatedPayload) {
    const value = updatedPayload[key];
    if (
      value !== null &&
      value !== undefined &&
      !(typeof value === "string" && value.trim() === "")
    ) {
      cleanPayload[key] = value;
    }
  }

  fetch(`${baseUrl}/users/update-yajman-yadi`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload),
  })
    .then((res) => res.json())
    .then(() => {
      Swal.fire("Updated", "Data updated successfully", "success");
      setShowEditForm(false);
      fetchData();
    })
    .catch((err) => {
      Swal.fire("Error", "Update failed", "error");
      console.error(err);
    });
};



  const handleRowDoubleClick = (event) => {
    const fullRow = event.data;
    const members = [];

    if (!fullRow.isParent) {
      members.push(fullRow);
    } else {
      const related = rowData.filter((r) => r.parentId === fullRow.id || r.id === fullRow.id);
      related.forEach((m) =>
        members.push({
          id: m.id,
          fullName: m.full_name || m.name,
          age: m.age,
          mobile: m.mobile,
          gender: m.gender,
          aadhaar: m.aadhaar,
        })
      );
    }

    const payload = {
      memberCount: members.length,
      members,
      department: fullRow.department,
      address: fullRow.address,
      city: fullRow.city,
      village: fullRow.village,
      refName: fullRow.ref_name,
      refMobile: fullRow.ref_mobile,
      refCity: fullRow.ref_city,
      totalAmount: fullRow.total_amount,
      paymentStatus: fullRow.payment_status,
      paymentDate: fullRow.payment_date,
      slipNo: fullRow.slip_no,
      yajman_id: fullRow.yajman_id,
      id: fullRow.id,
    };

    setEditRowData(payload);
    setShowEditForm(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between flex-wrap gap-4 items-start mb-6">
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
    </div>
  );
}
