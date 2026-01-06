"use client";

import { getAllUsers } from "@/actions/admin";
import { Card, CardBody, CardHeader, Chip, Spinner, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { Users } from "@/utils/icons";
import { HiMagnifyingGlass, HiCalendar, HiCheckCircle, HiXCircle } from "react-icons/hi2";

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
          <p className="text-slate-400 mt-4">Memuat data user...</p>
        </div>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Users className="text-4xl mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">Gagal memuat data user</p>
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
            <Users className="text-emerald-400" /> Site Users
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Kelola pengguna terdaftar</p>
        </div>
        <Chip size="sm" variant="flat" className="bg-slate-700 text-slate-300">
          {users.length} users
        </Chip>
      </div>

      {/* Search */}
      <Input
        placeholder="Cari berdasarkan email..."
        value={searchQuery}
        onValueChange={setSearchQuery}
        startContent={<HiMagnifyingGlass className="text-slate-400" />}
        size="md"
        classNames={{
          inputWrapper: "bg-slate-800 border-slate-700",
        }}
      />

      {/* Users List */}
      <Card className="bg-slate-800/50 border border-slate-700/50">
        <CardHeader className="border-b border-slate-700/50 px-4 py-3">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-sm font-semibold text-white">Daftar User</h3>
              <p className="text-xs text-slate-400">
                Menampilkan {filteredUsers.length} dari {users.length} user
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="text-4xl mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">Tidak ada user ditemukan</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">
                        {user.email?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-white truncate">
                          {user.email || "No Email"}
                        </p>
                        {user.is_admin && (
                          <Chip size="sm" className="bg-amber-500/20 text-amber-400 text-xs">
                            Admin
                          </Chip>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <HiCalendar className="text-slate-500" />
                          {new Date(user.created_at).toLocaleDateString("id-ID")}
                        </span>
                        <span className="flex items-center gap-1">
                          {user.email_confirmed ? (
                            <><HiCheckCircle className="text-emerald-400" /> Terverifikasi</>
                          ) : (
                            <><HiXCircle className="text-red-400" /> Belum verifikasi</>
                          )}
                        </span>
                      </div>

                      {user.last_sign_in && (
                        <p className="text-xs text-slate-500 mt-1">
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
