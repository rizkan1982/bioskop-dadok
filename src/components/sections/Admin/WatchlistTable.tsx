"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";
import { format } from "date-fns";
import { getImageUrl } from "@/utils/movies";
import Image from "next/image";

interface WatchlistItem {
  user_id: string;
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

interface WatchlistTableProps {
  watchlist: WatchlistItem[];
}

export default function WatchlistTable({ watchlist }: WatchlistTableProps) {
  const columns = [
    { key: "media", label: "MEDIA" },
    { key: "user", label: "USER" },
    { key: "type", label: "TYPE" },
    { key: "rating", label: "RATING" },
    { key: "release", label: "RELEASE DATE" },
    { key: "added", label: "ADDED" },
  ];
  
  const renderCell = (item: WatchlistItem, columnKey: React.Key) => {
    switch (columnKey) {
      case "media":
        return (
          <div className="flex items-center gap-3">
            {item.poster_path && (
              <Image
                src={getImageUrl(item.poster_path, "poster")}
                alt={item.title}
                width={40}
                height={60}
                className="rounded-small object-cover"
              />
            )}
            <div className="flex flex-col">
              <p className="text-small font-semibold">{item.title}</p>
              <p className="text-tiny text-foreground-400">ID: {item.id}</p>
            </div>
          </div>
        );
      case "user":
        return (
          <p className="text-small font-medium">{item.profiles.username}</p>
        );
      case "type":
        return (
          <Chip
            color={item.type === "movie" ? "primary" : "secondary"}
            size="sm"
            variant="flat"
          >
            {item.type.toUpperCase()}
          </Chip>
        );
      case "rating":
        return (
          <div className="flex items-center gap-1">
            <span className="text-warning">★</span>
            <span className="text-small font-semibold">{item.vote_average.toFixed(1)}</span>
          </div>
        );
      case "release":
        return (
          <p className="text-small">
            {format(new Date(item.release_date), "MMM dd, yyyy")}
          </p>
        );
      case "added":
        return (
          <p className="text-small text-foreground-400">
            {format(new Date(item.created_at), "MMM dd, yyyy")}
          </p>
        );
      default:
        return null;
    }
  };
  
  return (
    <Table aria-label="Watchlist table">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={watchlist} emptyContent="No watchlist items found">
        {(item) => (
          <TableRow key={`${item.user_id}-${item.id}-${item.type}`}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
