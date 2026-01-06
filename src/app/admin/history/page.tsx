"use client";

import { getAllHistories } from "@/actions/admin";
import { Card, CardBody, CardHeader, Chip, Spinner, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { ListVideo, Eye } from "@/utils/icons";
import { HiMagnifyingGlass, HiFilm, HiTv, HiClock, HiUser } from "react-icons/hi2";

interface History {
  id: string;
  user_id: string;
  tmdb_id: number;
  content_type: string;
  title: string;
  poster_path: string | null;
  progress: number;
  duration: number;
  season_number: number | null;
  episode_number: number | null;
  watched_at: string;
  created_at: string;
  updated_at: string;
  profiles?: { email: string };
}

export default function AdminHistoryPage() {
  const [histories, setHistories] = useState<History[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<History[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchHistories() {
      const { data, success } = await getAllHistories();
      setHistories(data || []);
      setFilteredHistories(data || []);
      setSuccess(success);
      setLoading(false);
    }
    fetchHistories();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = histories.filter(h => 
        h.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistories(filtered);
    } else {
      setFilteredHistories(histories);
    }
  }, [searchQuery, histories]);

  const formatProgress = (progress: number, duration: number) => {
    if (duration === 0) return "0%";
    const percentage = Math.round((progress / duration) * 100);
    return `${Math.min(percentage, 100)}%`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}j ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-400 mt-4">Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <ListVideo className="text-4xl mx-auto mb-3 text-default-300" />
          <p className="text-default-400">Gagal memuat riwayat tontonan</p>
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
            <ListVideo className="text-primary" /> Watch History
          </h1>
          <p className="text-default-400 text-sm mt-1">
            Pantau aktivitas menonton pengguna
          </p>
        </div>
        <Chip color="primary" variant="flat" size="sm">
          {histories.length} records
        </Chip>
      </div>

      {/* Search */}
      <Input
        placeholder="Cari judul atau email user..."
        value={searchQuery}
        onValueChange={setSearchQuery}
        startContent={<HiMagnifyingGlass className="text-default-400" />}
        size="lg"
        classNames={{
          inputWrapper: "bg-white/5 border-white/10",
        }}
      />

      {/* History List */}
      <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
        <CardHeader className="border-b border-white/10 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Riwayat Terbaru</h3>
              <p className="text-xs sm:text-sm text-default-400">
                Menampilkan {filteredHistories.length} dari {histories.length} record
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {filteredHistories.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="text-4xl mx-auto mb-3 text-default-300" />
              <p className="text-default-400">Tidak ada riwayat ditemukan</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredHistories.map((history) => (
                <div key={history.id} className="p-4 sm:p-6 hover:bg-white/5 transition-colors">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Poster */}
                    <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden bg-default-100 flex-shrink-0">
                      {history.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${history.poster_path}`}
                          alt={history.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {history.content_type === "movie" ? (
                            <HiFilm className="text-2xl text-default-300" />
                          ) : (
                            <HiTv className="text-2xl text-default-300" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <h4 className="font-semibold text-sm sm:text-base truncate flex-1">
                          {history.title}
                        </h4>
                        <Chip 
                          size="sm" 
                          color={history.content_type === "movie" ? "primary" : "secondary"} 
                          variant="flat"
                          className="flex-shrink-0"
                        >
                          {history.content_type === "movie" ? "🎬 Film" : "📺 TV"}
                        </Chip>
                      </div>

                      {history.content_type === "tv" && history.season_number && (
                        <p className="text-xs sm:text-sm text-default-400 mb-2">
                          Season {history.season_number}, Episode {history.episode_number}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-default-400 mb-2">
                        <span className="flex items-center gap-1">
                          <HiUser className="text-default-500" />
                          {history.profiles?.email || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiClock className="text-default-500" />
                          {new Date(history.updated_at).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: formatProgress(history.progress, history.duration) }}
                          />
                        </div>
                        <span className="text-xs text-default-400">
                          {formatProgress(history.progress, history.duration)}
                        </span>
                      </div>
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
