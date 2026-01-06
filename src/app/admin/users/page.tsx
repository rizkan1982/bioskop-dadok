"use client";

import { getAllUsers } from "@/actions/admin";
import { Card, CardBody, CardHeader, Chip, Spinner, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { Users, Eye } from "@/utils/icons";
import { HiMagnifyingGlass, HiEnvelope, HiCalendar, HiCheckCircle, HiXCircle } from "react-icons/hi2";

interface User {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in: string | null;
  email_confirmed: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      const { data, success } = await getAllUsers();
      setUsers(data || []);
      setFilteredUsers(data || []);
      setSuccess(success);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-400 mt-4">Memuat data user...</p>
        </div>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Users className="text-4xl mx-auto mb-3 text-default-300" />
          <p className="text-default-400">Gagal memuat data user</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent flex items-center gap-2">
            <Users className="text-primary" /> Site Users
          </h1>
          <p className="text-default-400 text-sm mt-1">
            Kelola pengguna terdaftar
          </p>
        </div>
        <Chip color="primary" variant="flat" size="sm">
          {users.length} users
        </Chip>
      </div>

      {/* Search */}
      <Input
        placeholder="Cari berdasarkan email..."
        value={searchQuery}
        onValueChange={setSearchQuery}
        startContent={<HiMagnifyingGlass className="text-default-400" />}
        size="lg"
        classNames={{
          inputWrapper: "bg-white/5 border-white/10",
        }}
      />

      {/* Users List */}
      <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
        <CardHeader className="border-b border-white/10 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Daftar User</h3>
              <p className="text-xs sm:text-sm text-default-400">
                Menampilkan {filteredUsers.length} dari {users.length} user
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="text-4xl mx-auto mb-3 text-default-300" />
              <p className="text-default-400">Tidak ada user ditemukan</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 sm:p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm sm:text-lg font-bold">
                        {user.email?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {user.email || "No Email"}
                        </p>
                        {user.is_admin && (
                          <Chip size="sm" color="warning" variant="flat">Admin</Chip>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-default-400">
                        <span className="flex items-center gap-1">
                          <HiCalendar className="text-default-500" />
                          {new Date(user.created_at).toLocaleDateString("id-ID")}
                        </span>
                        <span className="flex items-center gap-1">
                          {user.email_confirmed ? (
                            <><HiCheckCircle className="text-success" /> Terverifikasi</>
                          ) : (
                            <><HiXCircle className="text-danger" /> Belum verifikasi</>
                          )}
                        </span>
                      </div>

                      {user.last_sign_in && (
                        <p className="text-xs text-default-500 mt-1">
                          Login terakhir: {new Date(user.last_sign_in).toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
