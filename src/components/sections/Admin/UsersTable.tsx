"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
} from "@heroui/react";
import { env } from "@/utils/env";
import { format } from "date-fns";

interface User {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in: string | null;
  email_confirmed: boolean;
}

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const columns = [
    { key: "user", label: "USER" },
    { key: "email", label: "EMAIL" },
    { key: "role", label: "ROLE" },
    { key: "status", label: "STATUS" },
    { key: "joined", label: "JOINED" },
    { key: "last_signin", label: "LAST SIGN IN" },
  ];
  
  const renderCell = (user: User, columnKey: React.Key) => {
    switch (columnKey) {
      case "user":
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={`${env.NEXT_PUBLIC_AVATAR_PROVIDER_URL}${user.email}`}
              name={user.username}
              size="sm"
            />
            <div className="flex flex-col">
              <p className="text-small font-semibold">{user.username}</p>
              <p className="text-tiny text-foreground-400">{user.id.slice(0, 8)}...</p>
            </div>
          </div>
        );
      case "email":
        return <p className="text-small">{user.email}</p>;
      case "role":
        return (
          <Chip
            color={user.is_admin ? "danger" : "default"}
            size="sm"
            variant="flat"
          >
            {user.is_admin ? "Admin" : "User"}
          </Chip>
        );
      case "status":
        return (
          <Chip
            color={user.email_confirmed ? "success" : "warning"}
            size="sm"
            variant="dot"
          >
            {user.email_confirmed ? "Verified" : "Pending"}
          </Chip>
        );
      case "joined":
        return (
          <p className="text-small">
            {format(new Date(user.created_at), "MMM dd, yyyy")}
          </p>
        );
      case "last_signin":
        return (
          <p className="text-small text-foreground-400">
            {user.last_sign_in
              ? format(new Date(user.last_sign_in), "MMM dd, yyyy HH:mm")
              : "Never"}
          </p>
        );
      default:
        return null;
    }
  };
  
  return (
    <Table aria-label="Users table">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={users} emptyContent="No users found">
        {(user) => (
          <TableRow key={user.id}>
            {(columnKey) => (
              <TableCell>{renderCell(user, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
