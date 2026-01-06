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
          <p className="text-default-400 mt-4">Memuat data admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent flex items-center gap-2">
            <HiShieldCheck className="text-primary" /> Admin Users
          </h2>
          <p className="text-default-400 text-sm mt-1">Kelola pengguna admin</p>
        </div>
        <Button 
          color="primary" 
          startContent={<HiPlus className="text-lg" />}
          onPress={onOpen}
          size="md"
          className="w-full sm:w-auto"
        >
          Tambah Admin
        </Button>
      </div>

      {/* Admin List */}
      <Card className="p-4 sm:p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          👥 Daftar Admin
        </h3>

        {users.length === 0 ? (
          <div className="text-center py-12 text-default-400">
            <Users className="text-4xl mx-auto mb-3 opacity-50" />
            <p className="mb-2">Belum ada admin di database.</p>
            <p className="text-sm text-default-500">
              Klik tombol "Tambah Admin" untuk menambahkan admin baru.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10"
              >
                {/* Avatar */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-bold flex-shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-sm sm:text-base truncate">{user.username}</span>
                    <Chip 
                      color={user.role === "admin" ? "primary" : "secondary"} 
                      variant="flat" 
                      size="sm"
                    >
                      {user.role}
                    </Chip>
                  </div>
                  <p className="text-xs sm:text-sm text-default-400 truncate flex items-center gap-1">
                    <HiEnvelope className="flex-shrink-0" />
                    {user.email}
                  </p>
                </div>

                {/* Actions */}
                <Button 
                  size="sm" 
                  color="danger" 
                  variant="flat"
                  isIconOnly
                  className="flex-shrink-0"
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
      <Card className="p-4 bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
            🔐
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base">Informasi Keamanan</p>
            <p className="text-xs sm:text-sm text-default-400 mt-1">
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
          base: "sm:max-w-lg sm:mx-auto sm:my-auto sm:rounded-2xl",
          wrapper: "sm:items-center",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1 border-b border-white/10">
                ➕ Tambah Admin Baru
              </ModalHeader>
              <ModalBody className="py-4 sm:py-6">
                <div className="space-y-4">
                  <Input
                    label="Username"
                    placeholder="admin"
                    value={formData.username}
                    onValueChange={(value) => setFormData({ ...formData, username: value })}
                    isRequired
                    size="lg"
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onValueChange={(value) => setFormData({ ...formData, email: value })}
                    isRequired
                    size="lg"
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
                    size="lg"
                  />
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-white/10">
                <Button color="danger" variant="flat" onPress={onClose} className="flex-1 sm:flex-none">
                  Batal
                </Button>
                <Button color="primary" type="submit" isLoading={saving} className="flex-1 sm:flex-none">
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
