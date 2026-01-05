"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  Button, 
  Input, 
  Select, 
  SelectItem, 
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/react";
import { Users, Eye, EyeOff, Trash } from "@/utils/icons";
import { HiPlus, HiPencil } from "react-icons/hi2";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        await fetchUsers();
        resetForm();
        onClose();
      } else {
        alert(data.message || "Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "admin",
    });
    setShowPassword(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent flex items-center gap-2">
            <Users className="text-primary" /> Users
          </h2>
          <p className="text-default-400 mt-1">Manage admin users</p>
        </div>
        <Chip color="primary" variant="flat" size="lg">
          {users.length} Live
        </Chip>
      </div>

      {/* Add New Admin Card */}
      <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            👥 Admin Users
          </h3>
          <Button 
            color="primary" 
            startContent={<HiPlus className="text-xl" />}
            onPress={onOpen}
          >
            Add New Admin
          </Button>
        </div>

        {/* Admin Users List */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">📋 Admin Users List</h4>
          
          {users.length === 0 ? (
            <div className="text-center py-12 text-default-400">
              <Users className="text-4xl mx-auto mb-3 opacity-50" />
              <p className="mb-2">No admin users in database yet.</p>
              <p className="text-sm">
                Default login: <span className="text-primary font-semibold">admin</span> / <span className="text-primary font-semibold">admin123</span>
              </p>
            </div>
          ) : (
            <Table aria-label="Admin users table" className="min-w-full">
              <TableHeader>
                <TableColumn>USERNAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>CREATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        color={user.role === "admin" ? "primary" : "secondary"} 
                        variant="flat" 
                        size="sm"
                      >
                        {user.role}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-default-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          color="danger" 
                          variant="flat"
                          startContent={<Trash size={14} />}
                          onPress={() => handleDelete(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Default Credentials Info */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            🔐
          </div>
          <div>
            <p className="font-semibold">Default Admin Credentials</p>
            <p className="text-sm text-default-400">
              Username: <code className="text-primary bg-primary/10 px-2 py-0.5 rounded">admin</code> | 
              Password: <code className="text-primary bg-primary/10 px-2 py-0.5 rounded">admin123</code>
            </p>
          </div>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                ➕ Add New Admin
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Username"
                    placeholder="admin"
                    value={formData.username}
                    onValueChange={(value) => setFormData({ ...formData, username: value })}
                    isRequired
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onValueChange={(value) => setFormData({ ...formData, email: value })}
                    isRequired
                  />
                  
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onValueChange={(value) => setFormData({ ...formData, password: value })}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-default-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                    isRequired
                  />
                  
                  <Select
                    label="Role"
                    selectedKeys={[formData.role]}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <SelectItem key="admin">Admin</SelectItem>
                    <SelectItem key="moderator">Moderator</SelectItem>
                    <SelectItem key="editor">Editor</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={saving}>
                  Add User
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
