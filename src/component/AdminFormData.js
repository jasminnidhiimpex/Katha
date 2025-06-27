import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { baseUrl } from "../utils/url";
import { Link } from "react-router-dom";

export default function AdminFormData() {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [defaultColDef] = useState({
    sortable: true,
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 80,
  });
  const [gridApi, setGridApi] = useState(null);
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseUrl}/users/get-yajman-yadi`);
        const json = await res.json();
        const data = json.data;
        const total = json.total;
        setTotals(total);

        const flatRows = [];
        const fieldSet = new Set();

        data.forEach((parent, pIndex) => {
          const parentId = `P-${parent.id}`;
          flatRows.push({
            ...parent,
            id: parentId,
            isParent: true,
            expanded: false,
            hidden: false,
          });

          Object.keys(parent).forEach((k) => {
            if (k !== "children") fieldSet.add(k);
          });

          parent.children?.forEach((child, cIndex) => {
            flatRows.push({
              ...child,
              id: `C-${parent.id}-${cIndex}`,
              parentId: parentId,
              isParent: false,
              hidden: true,
            });

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
                  <button
                    onClick={() => toggleExpand(data.id)}
                    style={{ fontSize: 14, background: "none", border: "none", cursor: "pointer" }}
                  >
                    {data.expanded ? "▼" : "▶"}
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
            editable: true,
            filter: true,
            sortable: true,
            cellClass: (params) =>
              params.node.rowPinned === "bottom" ? "font-bold bg-yellow-100" : "",
            cellStyle: (params) =>
              params.data?.isParent ? { backgroundColor: "#FFF7D6", fontWeight: "bold" } : {},
            valueFormatter: (params) =>
              key.includes("date") && params.value
                ? new Date(params.value).toLocaleDateString("en-IN")
                : params.value,
          })),
        ];

        setColumnDefs(dynamicColumns);
        setRowData(flatRows);
        updatePinnedTotals(flatRows.filter((r) => r.isParent));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

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

    setPinnedBottomRowData([{
      name: "Total",
      member_count: totalMembers,
      total_amount: totalPending + totalReceived,
      payment_status: "",
    }]);
  };

  const handleFilterChange = () => {
    if (!gridApi) return;
    const visibleParents = [];
    gridApi.forEachNodeAfterFilterAndSort((node) => {
      if (!node.data.hidden && node.data.isParent) {
        visibleParents.push(node.data);
      }
    });
    updatePinnedTotals(visibleParents);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between flex-wrap gap-4 items-start mb-6">
        <h1 className="text-3xl font-bold text-yellow-700">Yajman Yadi</h1>

        <div className="flex flex-wrap gap-3">
          {totals && (
            <>
              <div className="bg-yellow-600 text-white px-4 py-2 rounded shadow">
                Total Members: {totals.total_members}
              </div>
              <div className="bg-yellow-600 text-white px-4 py-2 rounded shadow">
                Pending Amount: ₹{totals.total_pending_amount}
              </div>
              <div className="bg-yellow-600 text-white px-4 py-2 rounded shadow">
                Received Amount: ₹{totals.total_received_amount}
              </div>
            </>
          )}
          <Link to="/formData">
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded shadow">
              + Add Data
            </button>
          </Link>
          <Link to="/signup">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded shadow">
              Sign Up
            </button>
          </Link>
          <Link to="/">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow">
              Logout
            </button>
          </Link>
        </div>
      </div>

      <div className="ag-theme-alpine border border-gray-200" style={{ height: "88vh", width: "100%" }}>
        <AgGridReact
          onGridReady={(params) => setGridApi(params.api)}
          onFilterChanged={handleFilterChange}
          rowData={rowData.filter((row) => !row.hidden)}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pinnedBottomRowData={pinnedBottomRowData}
          suppressRowClickSelection={true}
        />
      </div>
    </div>
  );
}
