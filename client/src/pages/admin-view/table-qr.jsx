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
import { addSpacesFormControls, addTableFormControls } from "@/config";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addSpaces,
  addTable,
  fetchSpaces,
  getTable,
  updateTable,
} from "@/store/admin-slice/table";
import { toast } from "react-hot-toast";
import { MdDeleteOutline } from "react-icons/md";

const initialformData = {
  name: "",
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
  const dispatch = useDispatch();

  const { tables, spaces } = useSelector((state) => state.adminTable);
  const [formData, setFormData] = useState(initialformData);
  const [spaceFormData, setSpaceFormData] = useState(initialSpaceFormData);
  const [collapseStates, setCollapseStates] = useState({});

  useEffect(() => {
    dispatch(getTable());
    dispatch(fetchSpaces());
  }, [dispatch]);

  function onSubmit(e) {
    e.preventDefault();
    if (currentEditedId) {
      dispatch(updateTable({ id: currentEditedId, formData })).then((res) => {
        if (res.payload.success) {
          toast.success("Table Updated Successfully");
          setOpenAddTable(false);
          setFormData(initialformData);
        }
      });
    } else {
      dispatch(addTable(formData)).then((res) => {
        if (res.payload.success) {
          setFormData(initialformData);
          toast.success("Table Added Successfully");
          setOpenAddTable(false);
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

  // Create a modified version of addTableFormControls with dynamic spaces options
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

  const toggleCollapse = (spaceId) => {
    setCollapseStates((prev) => ({
      ...prev,
      [spaceId]: !prev[spaceId],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between p-3 md:p-4">
        <h1 className="text-xl font-semibold">Manage Table</h1>
        <div className="flex gap-2 items-center">
          {/* Add Table */}
          <Sheet open={openaddTable} onOpenChange={setOpenAddTable}>
            <Button
              className="bg-primary1 hover:bg-primary1 rounded-lg"
              onClick={() => setOpenAddTable(true)}
            >
              Add Table
            </Button>
            <SheetContent className="w-96 overflow-y-scroll" side="right">
              <SheetHeader className="border-b">
                <SheetTitle className="font-semibold">Add Table</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-4">
                <CommonForm
                  formData={formData}
                  setformData={setFormData}
                  buttonText="Add"
                  formControls={dynamicTableFormControls}
                  onSubmit={onSubmit}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Add Space */}
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
                  {spaces && spaces.length > 0 ? (
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

      {/* Spaces + Tables */}
      <div className="p-3 md:p-4 mt-4">
        {spaces && spaces.length > 0 ? (
          spaces.map((space) => {
            const tablesForSpace = tables.filter(
              (table) => table.spaces === space._id
            );
            const isOpen = collapseStates[space._id] || false;

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
                  <div className="flex items-center justify-between mb-3 gap-2 cursor-pointer   rounded-md">
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
                            className={`card w-full p-3 rounded shadow border ${cardColor}`}
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
    </div>
  );
};

export default AdminTableQR;
