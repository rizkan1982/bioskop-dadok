"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  SelectItem, 
  Switch, 
  Chip, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  useDisclosure,
  Spinner,
  Progress
} from "@heroui/react";
import { Eye, EyeOff, Trash, TrendUp } from "@/utils/icons";
import { HiPlus, HiPencil, HiArrowTopRightOnSquare, HiPhoto, HiXMark } from "react-icons/hi2";
import type { Ad } from "@/actions/ads";

export default function AdsManagementPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    link_url: "",
    position: "top",
    is_active: true,
    end_date: "",
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ads");
      const data = await res.json();

      if (data.success) {
        setAds(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();

      if (data.success) {
        setFormData({ ...formData, image_url: data.data.url });
      } else {
        alert(data.message || "Gagal mengupload gambar");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Terjadi kesalahan saat mengupload");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      alert("Silakan upload gambar banner terlebih dahulu");
      return;
    }

    try {
      setSaving(true);
      const url = editingAd ? `/api/ads/${editingAd.id}` : "/api/ads";
      const method = editingAd ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        await fetchAds();
        resetForm();
        onClose();
      } else {
        alert(data.message || "Gagal menyimpan iklan");
      }
    } catch (error) {
      console.error("Error saving ad:", error);
      alert("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus iklan ini?")) return;

    try {
      const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        await fetchAds();
      } else {
        alert(data.message || "Gagal menghapus iklan");
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleToggleActive = async (ad: Ad) => {
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !ad.is_active }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchAds();
      }
    } catch (error) {
      console.error("Error toggling ad status:", error);
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url || "",
      position: ad.position,
      is_active: ad.is_active,
      end_date: ad.end_date ? ad.end_date.split("T")[0] : "",
    });
    onOpen();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      image_url: "",
      link_url: "",
      position: "top",
      is_active: true,
      end_date: "",
    });
    setEditingAd(null);
  };

  const handleOpenNew = () => {
    resetForm();
    onOpen();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-400 mt-4">Memuat data iklan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 border border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
              🎯 Manajemen Iklan
            </h2>
            <p className="text-default-400 text-sm mt-1">Kelola banner iklan kustom</p>
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 text-xs sm:text-sm">
              <span className="text-default-500">
                Total: <strong className="text-primary">{ads.length}</strong>
              </span>
              <span className="text-default-500">
                Aktif: <strong className="text-success">{ads.filter(a => a.is_active).length}</strong>
              </span>
            </div>
          </div>
          <Button
            color="primary"
            startContent={<HiPlus className="text-lg sm:text-xl" />}
            onPress={handleOpenNew}
            size="md"
            className="w-full sm:w-auto font-semibold"
          >
            Tambah Iklan
          </Button>
        </div>
      </Card>

      {/* Ads List */}
      <div className="space-y-4">
        {ads.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center border border-dashed border-default-300">
            <HiPhoto className="text-4xl sm:text-5xl mx-auto mb-4 text-default-300" />
            <p className="text-default-400 text-sm sm:text-base">Belum ada iklan. Tambahkan iklan pertama Anda!</p>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow border border-white/5">
              <div className="flex flex-col gap-4">
                {/* Image Preview */}
                <div className="w-full h-32 sm:h-40 rounded-xl overflow-hidden bg-default-100">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23374151' width='400' height='200'/%3E%3Ctext fill='%239CA3AF' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold truncate">{ad.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Chip size="sm" variant="flat" color="primary">{ad.position.toUpperCase()}</Chip>
                        <Chip size="sm" color={ad.is_active ? "success" : "default"} variant="flat">
                          {ad.is_active ? "Aktif" : "Nonaktif"}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-default-400 block">Dibuat</span>
                      <span className="font-medium">{new Date(ad.created_at).toLocaleDateString("id-ID")}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-default-400 block">Klik</span>
                      <span className="font-medium text-primary flex items-center gap-1">
                        <TrendUp className="text-xs" />
                        {ad.click_count}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color={ad.is_active ? "default" : "success"}
                      startContent={ad.is_active ? <EyeOff className="text-sm" /> : <Eye className="text-sm" />}
                      onPress={() => handleToggleActive(ad)}
                      className="flex-1 sm:flex-none"
                    >
                      {ad.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      startContent={<HiPencil className="text-sm" />}
                      onPress={() => handleEdit(ad)}
                      className="flex-1 sm:flex-none"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      startContent={<Trash className="text-sm" />}
                      onPress={() => handleDelete(ad.id)}
                      className="flex-1 sm:flex-none"
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="full" 
        scrollBehavior="inside"
        classNames={{
          base: "sm:max-w-2xl sm:mx-auto sm:my-auto sm:rounded-2xl",
          wrapper: "sm:items-center",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1 border-b border-white/10">
                <span className="text-lg sm:text-xl">
                  {editingAd ? "✏️ Edit Iklan" : "➕ Tambah Iklan Baru"}
                </span>
              </ModalHeader>
              <ModalBody className="py-4 sm:py-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Title */}
                  <Input
                    label="Judul Iklan"
                    placeholder="Contoh: Promo Diskon 50%"
                    value={formData.title}
                    onValueChange={(value) => setFormData({ ...formData, title: value })}
                    isRequired
                    size="lg"
                    classNames={{ label: "text-sm font-medium" }}
                  />

                  {/* Position */}
                  <Select
                    label="Posisi Banner"
                    selectedKeys={[formData.position]}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as string })}
                    isRequired
                    size="lg"
                    classNames={{ label: "text-sm font-medium" }}
                  >
                    <SelectItem key="top">🔝 Top - Banner Atas</SelectItem>
                    <SelectItem key="middle">📍 Middle - Banner Tengah</SelectItem>
                    <SelectItem key="bottom">⬇️ Bottom - Banner Bawah</SelectItem>
                    <SelectItem key="sidebar">📌 Sidebar - Samping</SelectItem>
                  </Select>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Gambar Banner <span className="text-danger">*</span>
                    </label>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {formData.image_url ? (
                      <div className="relative rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-40 sm:h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: "" })}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                        >
                          <HiXMark />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full h-40 sm:h-48 rounded-xl border-2 border-dashed border-default-300 hover:border-primary transition-colors flex flex-col items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <Spinner size="md" color="primary" />
                            <span className="text-sm text-default-400">Mengupload...</span>
                            <Progress
                              value={uploadProgress}
                              className="max-w-[200px]"
                              size="sm"
                              color="primary"
                            />
                          </>
                        ) : (
                          <>
                            <HiPhoto className="text-4xl text-default-300" />
                            <span className="text-sm text-default-400">Klik untuk upload gambar</span>
                            <span className="text-xs text-default-300">JPEG, PNG, GIF, WebP (max 5MB)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Link URL */}
                  <Input
                    label="Link Tujuan (Opsional)"
                    placeholder="https://website-tujuan.com"
                    value={formData.link_url}
                    onValueChange={(value) => setFormData({ ...formData, link_url: value })}
                    size="lg"
                    classNames={{ label: "text-sm font-medium" }}
                    startContent={<HiArrowTopRightOnSquare className="text-default-400" />}
                  />

                  {/* End Date */}
                  <Input
                    type="date"
                    label="Tanggal Berakhir (Opsional)"
                    value={formData.end_date}
                    onValueChange={(value) => setFormData({ ...formData, end_date: value })}
                    size="lg"
                    classNames={{ label: "text-sm font-medium" }}
                  />

                  {/* Active Switch */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="font-medium">Aktifkan Iklan</p>
                      <p className="text-xs text-default-400">Tampilkan iklan di website</p>
                    </div>
                    <Switch
                      isSelected={formData.is_active}
                      onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                      size="lg"
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-white/10">
                <Button color="danger" variant="flat" onPress={onClose} className="flex-1 sm:flex-none">
                  Batal
                </Button>
                <Button 
                  color="primary" 
                  type="submit" 
                  isLoading={saving}
                  isDisabled={!formData.image_url}
                  className="flex-1 sm:flex-none"
                >
                  {editingAd ? "Update" : "Simpan"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
