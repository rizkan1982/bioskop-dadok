"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Progress,
} from "@heroui/react";
import { format } from "date-fns";
import { getImageUrl } from "@/utils/movies";
import Image from "next/image";

interface History {
  id: string;
  media_id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  season: number;
  episode: number;
  duration: number;
  last_position: number;
  completed: boolean;
  updated_at: string;
  profiles: {
    username: string;
  };
}

interface HistoryTableProps {
  histories: History[];
}

export default function HistoryTable({ histories }: HistoryTableProps) {
  const columns = [
    { key: "media", label: "MEDIA" },
    { key: "user", label: "USER" },
    { key: "type", label: "TYPE" },
    { key: "progress", label: "PROGRESS" },
    { key: "status", label: "STATUS" },
    { key: "watched", label: "LAST WATCHED" },
  ];
  
  const renderCell = (history: History, columnKey: React.Key) => {
    const progressPercent = history.duration > 0 
      ? Math.round((history.last_position / history.duration) * 100) 
      : 0;
    
    switch (columnKey) {
      case "media":
        return (
          <div className="flex items-center gap-3">
            {history.poster_path && (
              <Image
                src={getImageUrl(history.poster_path, "poster")}
                alt={history.title}
                width={40}
                height={60}
                className="rounded-small object-cover"
              />
            )}
            <div className="flex flex-col">
              <p className="text-small font-semibold">{history.title}</p>
              {history.type === "tv" && (
                <p className="text-tiny text-foreground-400">
                  S{history.season} E{history.episode}
                </p>
              )}
            </div>
          </div>
        );
      case "user":
        return (
          <p className="text-small font-medium">{history.profiles.username}</p>
        );
      case "type":
        return (
          <Chip
            color={history.type === "movie" ? "primary" : "secondary"}
            size="sm"
            variant="flat"
          >
            {history.type.toUpperCase()}
          </Chip>
        );
      case "progress":
        return (
          <div className="flex items-center gap-2">
            <Progress 
              value={progressPercent} 
              className="max-w-md" 
              size="sm"
              color={progressPercent === 100 ? "success" : "primary"}
            />
            <span className="text-tiny text-foreground-400 w-12">
              {progressPercent}%
            </span>
          </div>
        );
      case "status":
        return (
          <Chip
            color={history.completed ? "success" : "warning"}
            size="sm"
            variant="dot"
          >
            {history.completed ? "Completed" : "In Progress"}
          </Chip>
        );
      case "watched":
        return (
          <p className="text-small text-foreground-400">
            {format(new Date(history.updated_at), "MMM dd, yyyy HH:mm")}
          </p>
        );
      default:
        return null;
    }
  };
  
  return (
    <Table aria-label="Watch history table">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={histories} emptyContent="No watch history found">
        {(history) => (
          <TableRow key={history.id}>
            {(columnKey) => (
              <TableCell>{renderCell(history, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
