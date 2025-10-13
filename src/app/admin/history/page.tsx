"use client";

import { getAllHistories } from "@/actions/admin";
import HistoryTable from "@/components/sections/Admin/HistoryTable";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useEffect, useState } from "react";

export default function AdminHistoryPage() {
  const [histories, setHistories] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchHistories() {
      const { data, success } = await getAllHistories();
      setHistories(data || []);
      setSuccess(success);
      setLoading(false);
    }
    fetchHistories();
  }, []);
  
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-500">Loading...</p>
      </div>
    );
  }
  
  if (!success || !histories) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-500">Failed to load watch history data</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Watch History</h1>
        <p className="text-foreground-500 mt-2">
          Monitor all user watch activities
        </p>
      </div>
      
      <Card>
        <CardHeader className="border-foreground-200 flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-lg font-semibold">Recent Watch History</h3>
            <p className="text-small text-foreground-400">
              Showing latest {histories.length} record{histories.length !== 1 ? "s" : ""}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <HistoryTable histories={histories} />
        </CardBody>
      </Card>
    </div>
  );
}
