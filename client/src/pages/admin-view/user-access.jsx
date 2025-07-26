"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import {
  deleteUser,
  editUser,
  getUsersByRole,
  registerUser,
} from "@/store/auth-slice/auth";
import { FaUserEdit } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CommonForm from "@/components/common/form";
import { registerFormControls } from "@/config";
import toast from "react-hot-toast";

const RoleSection = ({
  title,
  users,
  usersLoading,
  onConfirmDelete,
  setFormData,
  formData,
  handleupdateUser,
}) => {
  const [openEditId, setOpenEditId] = useState(null);

  return (
    <div className="bg-muted p-6 rounded-xl">
      <h2 className="text-lg font-bold mb-4">{title.toUpperCase()}</h2>

      {usersLoading ? (
        <p className="text-muted-foreground animate-pulse">
          Loading {title} users...
        </p>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground">
          No {title.toLowerCase()} users found.
        </p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between bg-white p-3 rounded-lg shadow"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary1 text-white cursor-pointer">
                    {user.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">{user.username}</p>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Dialog
                  open={openEditId === user._id}
                  onOpenChange={(open) =>
                    setOpenEditId(open ? user._id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <FaUserEdit
                      className="w-4 h-4 text-primary1 cursor-pointer"
                      onClick={() =>
                        setFormData({
                          id: user._id,
                          username: user.username,
                          email: user.email,
                          role: user.role,
                          password: "",
                        })
                      }
                    />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <CommonForm
                      formData={formData}
                      setformData={setFormData}
                      buttonText="Update User"
                      formControls={registerFormControls}
                      onSubmit={() => {
                        handleupdateUser();
                        setOpenEditId(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>

                <Trash2
                  onClick={() =>
                    onConfirmDelete({
                      id: user._id,
                      username: user.username,
                      role: user.role,
                    })
                  }
                  className="h-4 w-4 text-red-600 cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const initialformData = {
  username: "",
  email: "",
  password: "",
  role: "staff",
};

const AdminUser = () => {
  const dispatch = useDispatch();
  const { usersByRole, usersLoading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState(initialformData);
  const [admins, setAdmins] = useState([]);
  const [staff, setStaff] = useState([]);
  const [kitchen, setKitchen] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = () => {
    dispatch(getUsersByRole("admin")).then((res) =>
      setAdmins(res.payload || [])
    );
    dispatch(getUsersByRole("staff")).then((res) =>
      setStaff(res.payload || [])
    );
    dispatch(getUsersByRole("kitchen")).then((res) =>
      setKitchen(res.payload || [])
    );
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  const handleDelete = (userId, role) => {
    dispatch(deleteUser(userId))
      .unwrap()
      .then(() => {
        toast.success("User deleted successfully!");
        fetchUsers();
      })
      .catch((error) => {
        console.error("Delete error:", error);
        toast.error("Failed to delete user");
      });
  };

  const handleupdateUser = () => {
    const { id, username, email, password, role } = formData;
    const updatedFields = {
      username,
      email,
      role,
      ...(password && { password }),
    };

    dispatch(editUser({ userId: id, updatedData: updatedFields }))
      .unwrap()
      .then(() => {
        toast.success("User updated successfully!");
        setFormData(initialformData);
        fetchUsers();
      })
      .catch((error) => {
        console.error("Update error:", error);
        toast.error("Failed to update user");
      });
  };

  const handleregisterUser = () => {
    dispatch(registerUser(formData))
      .unwrap()
      .then(() => {
        setFormData(initialformData);
        toast.success("User registered successfully!");
        fetchUsers();
      })
      .catch((error) => {
        console.error("Registration error:", error);
        toast.error("Failed to register user");
      });
  };

  return (
    <>
      <div className="space-y-6 p-4">
        <RoleSection
          title="admin"
          users={admins}
          usersLoading={usersLoading}
          onConfirmDelete={setDeleteTarget}
          setFormData={setFormData}
          formData={formData}
          handleupdateUser={handleupdateUser}
        />
        <RoleSection
          title="kitchen"
          users={kitchen}
          usersLoading={usersLoading}
          onConfirmDelete={setDeleteTarget}
          setFormData={setFormData}
          formData={formData}
          handleupdateUser={handleupdateUser}
        />
        <RoleSection
          title="staff"
          users={staff}
          usersLoading={usersLoading}
          onConfirmDelete={setDeleteTarget}
          setFormData={setFormData}
          formData={formData}
          handleupdateUser={handleupdateUser}
        />
      </div>

      {/* Add User Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-15 right-18 z-50 bg-primary1 text-white rounded-xl p-3 text-sm shadow-lg"
            title="Add New Item"
          >
            Add User +
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg text-primary1">
              Add New User
            </DialogTitle>
          </DialogHeader>
          <CommonForm
            formData={formData}
            setformData={setFormData}
            buttonText="Add User"
            formControls={registerFormControls}
            onSubmit={handleregisterUser}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.username}</strong>?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleDelete(deleteTarget.id, deleteTarget.role);
                setDeleteTarget(null);
              }}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg"
            >
              Confirm
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUser;
