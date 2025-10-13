"use client";

import { getAllUsers } from "@/actions/admin";
import UsersTable from "@/components/sections/Admin/UsersTable";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUsers() {
      const { data, success } = await getAllUsers();
      setUsers(data || []);
      setSuccess(success);
      setLoading(false);
    }
    fetchUsers();
  }, []);
  
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-500">Loading...</p>
      </div>
    );
  }
  
  if (!success || !users) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-500">Failed to load users data</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-foreground-500 mt-2">
          View and manage all registered users
        </p>
      </div>
      
      <Card>
        <CardHeader className="border-foreground-200 flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-lg font-semibold">All Users</h3>
            <p className="text-small text-foreground-400">
              Total: {users.length} user{users.length !== 1 ? "s" : ""}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <UsersTable users={users} />
        </CardBody>
      </Card>
    </div>
  );
}
