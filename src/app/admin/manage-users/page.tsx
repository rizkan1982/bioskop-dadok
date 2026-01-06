"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  Button, 
  Input, 
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import { Users, Eye, EyeOff, Trash } from "@/utils/icons";
import { HiPlus, HiShieldCheck, HiEnvelope } from "react-icons/hi2";

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
        alert(data.message || "Gagal menambah admin");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus admin ini?")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.message || "Gagal menghapus admin");
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
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-slate-400 mt-4">Memuat data admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <HiShieldCheck className="text-amber-400" /> Admin Users
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Kelola pengguna admin</p>
        </div>
        <Button 
          color="primary" 
          startContent={<HiPlus className="text-lg" />}
          onPress={onOpen}
          size="md"
          className="w-full sm:w-auto font-medium"
        >
          Tambah Admin
        </Button>
      </div>

      {/* Admin List */}
      <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-4">Daftar Admin</h3>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="text-4xl mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400 text-sm mb-1">Belum ada admin di database.</p>
            <p className="text-xs text-slate-500">
              Klik "Tambah Admin" untuk menambahkan admin baru.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600/50"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-white truncate">{user.username}</span>
                    <Chip 
                      size="sm"
                      className="bg-amber-500/20 text-amber-400 text-xs"
                    >
                      {user.role}
                    </Chip>
                  </div>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                    <HiEnvelope className="flex-shrink-0 text-slate-500" />
                    {user.email}
                  </p>
                </div>

                {/* Actions */}
                <Button 
                  size="sm" 
                  variant="flat"
                  isIconOnly
                  className="bg-red-500/20 text-red-400 flex-shrink-0"
                  onPress={() => handleDelete(user.id)}
                >
                  <Trash className="text-sm" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            🔐
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white">Informasi Keamanan</p>
            <p className="text-xs text-slate-400 mt-1">
              Admin memiliki akses penuh ke dashboard. Pastikan hanya memberikan akses kepada orang yang dipercaya.
            </p>
          </div>
        </div>
      </Card>

      {/* Add Admin Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="full"
        classNames={{
          base: "sm:max-w-md sm:mx-auto sm:my-auto sm:rounded-xl bg-slate-900",
          wrapper: "sm:items-center",
        }}
      >
        <ModalContent className="select-text">
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="border-b border-slate-700/50 pb-4">
                <span className="text-base font-semibold text-white">Tambah Admin Baru</span>
              </ModalHeader>
              <ModalBody className="py-4">
                <div className="space-y-4">
                  <Input
                    label="Username"
                    placeholder="admin"
                    value={formData.username}
                    onValueChange={(value) => setFormData({ ...formData, username: value })}
                    isRequired
                    size="md"
                    classNames={{
                      inputWrapper: "bg-slate-800 border-slate-700"
                    }}
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onValueChange={(value) => setFormData({ ...formData, email: value })}
                    isRequired
                    size="md"
                    classNames={{
                      inputWrapper: "bg-slate-800 border-slate-700"
                    }}
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
                        className="text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                    isRequired
                    size="md"
                    classNames={{
                      inputWrapper: "bg-slate-800 border-slate-700"
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-slate-700/50 pt-4">
                <Button 
                  variant="flat" 
                  onPress={onClose} 
                  className="bg-slate-700 text-slate-300 flex-1 sm:flex-none"
                >
                  Batal
                </Button>
                <Button 
                  color="primary" 
                  type="submit" 
                  isLoading={saving} 
                  className="flex-1 sm:flex-none"
                >
                  Tambah Admin
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
