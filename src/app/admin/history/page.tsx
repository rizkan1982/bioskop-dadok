"use client";

import { getAllHistories } from "@/actions/admin";
import { Spinner, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { 
  HiMagnifyingGlass, 
  HiFilm, 
  HiTv, 
  HiClock, 
  HiUser,
  HiPlayCircle,
  HiEye
} from "react-icons/hi2";

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

  const formatProgress = (progress: number | null | undefined, duration: number | null | undefined) => {
    // Handle null/undefined values
    const safeProgress = progress ?? 0;
    const safeDuration = duration ?? 0;
    
    if (safeDuration === 0 || safeProgress === 0) return "0%";
    const percentage = Math.round((safeProgress / safeDuration) * 100);
    if (isNaN(percentage)) return "0%";
    return `${Math.min(percentage, 100)}%`;
  };

  const getProgressValue = (progress: number | null | undefined, duration: number | null | undefined) => {
    // Handle null/undefined values
    const safeProgress = progress ?? 0;
    const safeDuration = duration ?? 0;
    
    if (safeDuration === 0 || safeProgress === 0) return 0;
    const value = Math.min(Math.round((safeProgress / safeDuration) * 100), 100);
    return isNaN(value) ? 0 : value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-slate-400 mt-4">Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <HiPlayCircle className="text-3xl text-red-400" />
          </div>
          <p className="text-slate-400">Gagal memuat riwayat tontonan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="select-text space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <HiPlayCircle className="text-xl text-violet-400" />
            </div>
            Watch History
          </h1>
          <p className="text-slate-400 text-sm mt-1 ml-[52px]">
            Pantau aktivitas menonton pengguna
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
          <HiEye className="text-violet-400" />
          <span className="text-white font-semibold">{histories.length}</span>
          <span className="text-slate-400 text-sm">Records</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Cari judul atau email user..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={<HiMagnifyingGlass className="text-slate-400" />}
          size="lg"
          classNames={{
            inputWrapper: "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800",
            input: "text-white placeholder:text-slate-500",
          }}
        />
      </div>

      {/* History List */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        {/* Card Header */}
        <div className="border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Riwayat Terbaru</h3>
              <p className="text-sm text-slate-400">
                Menampilkan {filteredHistories.length} dari {histories.length} record
              </p>
            </div>
          </div>
        </div>
        
        {/* Card Body */}
        {filteredHistories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
              <HiEye className="text-3xl text-slate-500" />
            </div>
            <p className="text-slate-400">Tidak ada riwayat ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredHistories.map((history) => (
              <div key={history.id} className="p-4 sm:p-6 hover:bg-slate-700/20 transition-colors">
                <div className="flex gap-4">
                  {/* Poster */}
                  <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden bg-slate-700/50 flex-shrink-0">
                    {history.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${history.poster_path}`}
                        alt={history.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {history.content_type === "movie" ? (
                          <HiFilm className="text-2xl text-slate-500" />
                        ) : (
                          <HiTv className="text-2xl text-slate-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <h4 className="font-semibold text-sm sm:text-base text-white truncate flex-1">
                        {history.title}
                      </h4>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        history.content_type === "movie" 
                          ? "bg-blue-500/20 text-blue-400" 
                          : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {history.content_type === "movie" ? (
                          <><HiFilm className="text-xs" /> Film</>
                        ) : (
                          <><HiTv className="text-xs" /> TV</>
                        )}
                      </span>
                    </div>

                    {history.content_type === "tv" && history.season_number && (
                      <p className="text-xs sm:text-sm text-slate-400 mb-2">
                        Season {history.season_number}, Episode {history.episode_number}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-400 mb-3">
                      <span className="flex items-center gap-1.5">
                        <HiUser className="text-slate-500" />
                        {history.profiles?.email || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HiClock className="text-slate-500" />
                        {new Date(history.updated_at).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            getProgressValue(history.progress, history.duration) >= 90 
                              ? "bg-emerald-500" 
                              : getProgressValue(history.progress, history.duration) >= 50 
                                ? "bg-blue-500" 
                                : "bg-violet-500"
                          }`}
                          style={{ width: formatProgress(history.progress, history.duration) }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-300 min-w-[40px] text-right">
                        {formatProgress(history.progress, history.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
