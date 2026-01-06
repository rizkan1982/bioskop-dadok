"use client";

import { getAllWatchlist } from "@/actions/admin";
import { Card, CardBody, CardHeader, Chip, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { ListVideo } from "@/utils/icons";
import { HiBookmark } from "react-icons/hi2";

export default function AdminWatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlist() {
      const result = await getAllWatchlist();
      setWatchlist(result.data || []);
      setSuccess(result.success);
      setMessage(result.message);
      setLoading(false);
    }
    fetchWatchlist();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-400 mt-4">Memuat data...</p>
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
            <HiBookmark className="text-primary" /> Watchlist
          </h1>
          <p className="text-default-400 text-sm mt-1">
            Lihat daftar tonton pengguna
          </p>
        </div>
        <Chip color="secondary" variant="flat" size="sm">
          {watchlist.length} items
        </Chip>
      </div>

      {/* Content */}
      <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
        <CardHeader className="border-b border-white/10 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Semua Watchlist</h3>
              <p className="text-xs sm:text-sm text-default-400">
                Total: {watchlist.length} item
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
          {!success ? (
            <div className="text-center py-12">
              <HiBookmark className="text-4xl sm:text-5xl mx-auto mb-4 text-default-300" />
              <p className="text-default-400 text-sm sm:text-base">{message}</p>
              <p className="text-xs text-default-500 mt-2">Fitur watchlist akan segera tersedia</p>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="text-center py-12">
              <ListVideo className="text-4xl mx-auto mb-3 text-default-300" />
              <p className="text-default-400">Belum ada item di watchlist</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((item: any) => (
                <Card key={item.id} className="p-4 bg-white/5 border border-white/10">
                  <div className="flex gap-3">
                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-default-100 flex-shrink-0">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HiBookmark className="text-2xl text-default-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                      <p className="text-xs text-default-400 mt-1">{item.type}</p>
                      <p className="text-xs text-default-500 mt-2">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
