"use client";

import { getAllWatchlist } from "@/actions/admin";
import WatchlistTable from "@/components/sections/Admin/WatchlistTable";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useEffect, useState } from "react";

export default function AdminWatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchWatchlist() {
      const { data, success } = await getAllWatchlist();
      setWatchlist(data || []);
      setSuccess(success);
      setLoading(false);
    }
    fetchWatchlist();
  }, []);
  
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-500">Loading...</p>
      </div>
    );
  }
  
  if (!success || !watchlist) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-500">Failed to load watchlist data</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <p className="text-foreground-500 mt-2">
          View all user watchlist items
        </p>
      </div>
      
      <Card>
        <CardHeader className="border-foreground-200 flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-lg font-semibold">All Watchlist Items</h3>
            <p className="text-small text-foreground-400">
              Total: {watchlist.length} item{watchlist.length !== 1 ? "s" : ""}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <WatchlistTable watchlist={watchlist} />
        </CardBody>
      </Card>
    </div>
  );
}
