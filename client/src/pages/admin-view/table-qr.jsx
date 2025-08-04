"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addSpaces,
  addTable,
  deleteTable,
  fetchSpaces,
  getTable,
  updateTable,
} from "@/store/admin-slice/table";
import { toast } from "react-hot-toast";
import { MdDeleteOutline } from "react-icons/md";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { addSpacesFormControls, addTableFormControls } from "@/config";

const initialformData = {
  tableName: "",
  capacity: "",
  status: "",
  spaces: "",
};

const initialSpaceFormData = {
  SpaceName: "",
};

const AdminTableQR = () => {
  const [openaddTable, setOpenAddTable] = useState(false);
  const [openaddSpaces, setOpenAddSpaces] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialformData);
  const [spaceFormData, setSpaceFormData] = useState(initialSpaceFormData);
  const [collapseStates, setCollapseStates] = useState({});

  const dispatch = useDispatch();
  const { tables, spaces } = useSelector((state) => state.adminTable);

  useEffect(() => {
    dispatch(getTable());
    dispatch(fetchSpaces());
  }, [dispatch]);

  function onSubmit(e) {
  e?.preventDefault?.();

  if (currentEditedId) {
    // ✅ Update case
    dispatch(updateTable({ id: currentEditedId, formData })).then((res) => {
      if (res.payload.success) {
        toast.success("Table Updated Successfully");
        setOpenAddTable(false);
        setFormData(initialformData);
        setCurrentEditedId(null);

        // Refresh list
        dispatch(getTable());
      }
    });
  } else {
    // ✅ Add case
    dispatch(addTable(formData)).then((res) => {
      if (res.payload.success) {
        toast.success("Table Added Successfully");
        setFormData(initialformData);
        setOpenAddTable(false);

        // Refresh list
        dispatch(getTable());
      }
    });
  }
}


  function onAddSpaceSubmit(e) {
    e.preventDefault();
    dispatch(addSpaces(spaceFormData)).then((res) => {
      if (res?.meta?.requestStatus === "fulfilled") {
        toast.success("Space Added Successfully");
        setOpenAddSpaces(false);
        setSpaceFormData(initialSpaceFormData);
        dispatch(fetchSpaces());
      } else {
        toast.error("Failed to add space");
      }
    });
  }

  const dynamicTableFormControls = addTableFormControls.map((control) => {
    if (control.name === "spaces") {
      return {
        ...control,
        options: spaces.map((space) => ({
          id: space._id,
          label: space.SpaceName,
        })),
      };
    }
    return control;
  });

  const getOptionLabel = (name, id) => {
    const control = addTableFormControls.find((ctrl) => ctrl.name === name);
    return control?.options?.find((opt) => opt.id === id)?.label || id;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4">
        <h1 className="text-xl font-semibold">Manage Table</h1>
        <div className="flex gap-2 items-center">
          {/* Add Table */}
          <Sheet open={openaddTable} onOpenChange={setOpenAddTable}>
            <Button
              className="bg-primary1 hover:bg-primary1 rounded-lg"
              onClick={() => {
                setFormData(initialformData);
                setCurrentEditedId(null);
                setOpenAddTable(true);
              }}
            >
              Add Table
            </Button>
            <SheetContent className="w-96 overflow-y-scroll" side="right">
              <SheetHeader className="border-b">
                <SheetTitle className="font-semibold">
                  {currentEditedId ? "Edit Table" : "Add Table"}
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-4">
                <CommonForm
                  formData={formData}
                  setformData={setFormData}
                  buttonText={currentEditedId ? "Update" : "Add"}
                  formControls={dynamicTableFormControls}
                  onSubmit={onSubmit}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Add Spaces */}
          <Sheet open={openaddSpaces} onOpenChange={setOpenAddSpaces}>
            <Button
              className="bg-primary1 hover:bg-primary1 rounded-lg"
              onClick={() => setOpenAddSpaces(true)}
            >
              Add Spaces
            </Button>
            <SheetContent className="w-96 overflow-y-scroll" side="right">
              <SheetHeader className="border-b">
                <SheetTitle className="font-semibold">Add Spaces</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-4">
                <div className="overflow-y-auto max-h-100 mb-10">
                  {spaces?.length > 0 ? (
                    spaces.map((space) => (
                      <div
                        key={space._id}
                        className="flex items-center justify-between border-b px-2 mb-2 py-1"
                      >
                        <span className="text-sm">{space.SpaceName}</span>
                        <MdDeleteOutline className="text-red-500 cursor-pointer hover:text-red-700" />
                      </div>
                    ))
                  ) : (
                    <p>No spaces available.</p>
                  )}
                </div>
                <CommonForm
                  formData={spaceFormData}
                  setformData={setSpaceFormData}
                  buttonText="Add"
                  formControls={addSpacesFormControls}
                  onSubmit={onAddSpaceSubmit}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Table Cards by Space */}
      <div className="p-3 md:p-4 mt-4">
        {spaces?.length > 0 ? (
          spaces.map((space) => {
            const tablesForSpace = tables.filter(
              (table) => table.spaces === space._id
            );
            return (
              <Collapsible
                key={space._id}
                open={collapseStates[space._id] || false}
                onOpenChange={(open) =>
                  setCollapseStates((prev) => ({
                    ...prev,
                    [space._id]: open,
                  }))
                }
                className="mb-4"
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between mb-3 gap-2 cursor-pointer rounded-md">
                    <h1 className="flex items-center gap-2 text-primary1 font-semibold">
                      {space.SpaceName}
                    </h1>
                    {collapseStates[space._id] ? (
                      <FaChevronUp className="text-primary1" />
                    ) : (
                      <FaChevronDown className="text-primary1" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {tablesForSpace.length > 0 ? (
                      tablesForSpace.map((table, index) => {
                        const statusLabel = getOptionLabel(
                          "status",
                          table.status
                        );
                        const cardColor =
                          statusLabel === "available"
                            ? "bg-green-200 border-primary1"
                            : statusLabel === "occupied"
                            ? "bg-red-200 border-red-600"
                            : statusLabel === "reserved"
                            ? "bg-blue-200 border-blue-600"
                            : "bg-gray-100";

                        return (
                          <div
                            key={index}
                            className={`card w-full p-3 rounded shadow border cursor-pointer ${cardColor}`}
                            onClick={() => {
                              setSelectedTable(table);
                              setShowModal(true);
                            }}
                          >
                            <h2 className="font-semibold text-lg text-center mb-2">
                              {table.tableName}
                            </h2>
                            <p className="text-sm text-center mb-2">
                              Capacity: {table.capacity}
                            </p>
                            <p className="text-sm text-center mb-2">
                              Status: {statusLabel}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground col-span-full">
                        No tables in this space.
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        ) : (
          <p className="text-muted-foreground">No spaces found.</p>
        )}
      </div>

      {/* Dialog for Table Action */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[400px] flex flex-col justify-between">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedTable?.tableName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-center">
            <p className="text-sm">Capacity: {selectedTable?.capacity}</p>
            <p className="text-sm">Status: {selectedTable?.status}</p>
          </div>

          <DialogFooter className="mt-6">
            <div className="flex justify-center w-full gap-4">
              <Button
                variant="destructive"
                size="sm"
                className="w-24 h-12 rounded-xl"
                onClick={() => {
                  dispatch(deleteTable(selectedTable._id)).then((res) => {
                    if (res.payload.success) {
                      toast.success("Table deleted");
                      setShowModal(false);
                      dispatch(getTable());
                    }
                  });
                }}
              >
                Delete
              </Button>
              <Button
                className="bg-gray-300 hover:bg-gray-400 text-black w-24 h-12 rounded-xl"
                onClick={() => {
                  setFormData({
                    tableName: selectedTable.tableName,
                    capacity: selectedTable.capacity,
                    status: selectedTable.status,
                    spaces: selectedTable.spaces,
                  })
                  setCurrentEditedId(selectedTable._id);
                  setOpenAddTable(true);
                  setShowModal(false);
                 
                }}
              >
                Edit
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTableQR;
