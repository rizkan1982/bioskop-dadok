"use client";

import { getAllWatchlist } from "@/actions/admin";
import { Spinner, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { 
  HiBookmark, 
  HiFilm, 
  HiTv, 
  HiUser,
  HiCalendar,
  HiMagnifyingGlass,
  HiQueueList,
  HiStar
} from "react-icons/hi2";

interface WatchlistItem {
  user_id: string;
  id: number;
  type?: string;
  content_type?: string;
  adult?: boolean;
  backdrop_path?: string | null;
  poster_path?: string | null;
  release_date?: string;
  title: string;
  vote_average?: number;
  created_at: string;
  profiles?: { email: string };
}

export default function AdminWatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState<WatchlistItem[]>([]);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchWatchlist() {
      const result = await getAllWatchlist();
      // Cast to unknown first then to WatchlistItem[] for flexible data structure
      const data = (result.data || []) as unknown as WatchlistItem[];
      setWatchlist(data);
      setFilteredWatchlist(data);
      setSuccess(result.success);
      setMessage(result.message);
      setLoading(false);
    }
    fetchWatchlist();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = watchlist.filter((item: WatchlistItem) => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWatchlist(filtered);
    } else {
      setFilteredWatchlist(watchlist);
    }
  }, [searchQuery, watchlist]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-slate-400 mt-4">Memuat data...</p>
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <HiBookmark className="text-xl text-amber-400" />
            </div>
            Watchlist
          </h1>
          <p className="text-slate-400 text-sm mt-1 ml-[52px]">
            Lihat daftar tonton pengguna
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
          <HiQueueList className="text-amber-400" />
          <span className="text-white font-semibold">{watchlist.length}</span>
          <span className="text-slate-400 text-sm">Items</span>
        </div>
      </div>

      {/* Search */}
      {success && watchlist.length > 0 && (
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
      )}

      {/* Content */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        {/* Card Header */}
        <div className="border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Semua Watchlist</h3>
              <p className="text-sm text-slate-400">
                {success 
                  ? `Menampilkan ${filteredWatchlist.length} dari ${watchlist.length} item`
                  : "Data tidak tersedia"
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Card Body */}
        <div className="p-6">
          {!success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <HiBookmark className="text-3xl text-slate-500" />
              </div>
              <p className="text-slate-300 font-medium">{message}</p>
              <p className="text-xs text-slate-500 mt-2">Fitur watchlist akan segera tersedia</p>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <HiQueueList className="text-3xl text-slate-500" />
              </div>
              <p className="text-slate-400">Belum ada item di watchlist</p>
            </div>
          ) : filteredWatchlist.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <HiMagnifyingGlass className="text-3xl text-slate-500" />
              </div>
              <p className="text-slate-400">Tidak ada hasil untuk "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWatchlist.map((item: WatchlistItem, index: number) => (
                <div 
                  key={`${item.user_id}-${item.id}-${item.type}`} 
                  className="bg-slate-700/30 rounded-xl border border-slate-600/30 p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Poster */}
                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-slate-700/50 flex-shrink-0">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {(item.content_type || item.type) === "movie" ? (
                            <HiFilm className="text-2xl text-slate-500" />
                          ) : (
                            <HiTv className="text-2xl text-slate-500" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-white truncate">{item.title}</h4>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          (item.content_type || item.type) === "movie" 
                            ? "bg-blue-500/20 text-blue-400" 
                            : "bg-purple-500/20 text-purple-400"
                        }`}>
                          {(item.content_type || item.type) === "movie" ? (
                            <><HiFilm className="text-xs" /> Film</>
                          ) : (
                            <><HiTv className="text-xs" /> TV</>
                          )}
                        </span>
                        
                        {item.vote_average && item.vote_average > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                            <HiStar className="text-xs" />
                            {Number(item.vote_average).toFixed(1)}
                          </span>
                        )}
                      </div>
                      
                      {item.profiles?.email && (
                        <p className="flex items-center gap-1 text-xs text-slate-400 mt-2 truncate">
                          <HiUser className="text-slate-500 flex-shrink-0" />
                          {item.profiles.email}
                        </p>
                      )}
                      
                      <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <HiCalendar className="flex-shrink-0" />
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
