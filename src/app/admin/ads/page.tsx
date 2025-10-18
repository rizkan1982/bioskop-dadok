"use client";

import { useState, useEffect } from "react";
import { Button, Card, Input, Select, SelectItem, Switch, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Eye, EyeOff, Trash, TrendUp } from "@/utils/icons";
import { HiPlus, HiPencil, HiArrowTopRightOnSquare } from "react-icons/hi2";
import type { Ad } from "@/actions/ads";

export default function AdsManagementPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-default-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 border border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
              🎯 Manajemen Iklan
            </h2>
            <p className="text-default-400 mt-2">Kelola banner iklan kustom di homepage</p>
            <div className="flex gap-4 mt-3 text-sm">
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
            startContent={<HiPlus className="text-xl" />}
            onPress={handleOpenNew}
            size="lg"
            className="font-semibold"
          >
            Tambah Iklan
          </Button>
        </div>
      </Card>

      <div className="grid gap-6">
        {ads.length === 0 ? (
          <Card className="p-12 text-center border border-dashed border-default-300">
            <p className="text-default-400 text-lg">Belum ada iklan. Tambahkan iklan pertama Anda!</p>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="p-6 hover:shadow-lg transition-shadow border border-white/5">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-default-100">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23374151' width='200' height='150'/%3E%3Ctext fill='%239CA3AF' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold">{ad.title}</h3>
                      <p className="text-sm text-default-400 mt-1">
                        Posisi: <Chip size="sm" variant="flat" color="primary">{ad.position.toUpperCase()}</Chip>
                      </p>
                    </div>
                    <Chip color={ad.is_active ? "success" : "default"} variant="flat">
                      {ad.is_active ? "Aktif" : "Nonaktif"}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-default-400">Dibuat:</span>{" "}
                      <span>{new Date(ad.created_at).toLocaleDateString("id-ID")}</span>
                    </div>
                    {ad.end_date && (
                      <div>
                        <span className="text-default-400">Berakhir:</span>{" "}
                        <span>{new Date(ad.end_date).toLocaleDateString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <TrendUp className="text-primary" />
                      <span className="text-default-400">Klik:</span>{" "}
                      <strong>{ad.click_count}</strong>
                    </div>
                    {ad.link_url && (
                      <div className="flex items-center gap-2 truncate">
                        <HiArrowTopRightOnSquare className="text-default-400" />
                        <a
                          href={ad.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          {ad.link_url}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color={ad.is_active ? "default" : "success"}
                      startContent={ad.is_active ? <EyeOff /> : <Eye />}
                      onPress={() => handleToggleActive(ad)}
                    >
                      {ad.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      startContent={<HiPencil />}
                      onPress={() => handleEdit(ad)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      startContent={<Trash />}
                      onPress={() => handleDelete(ad.id)}
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

      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                {editingAd ? "✏️ Edit Iklan" : "➕ Tambah Iklan Baru"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Judul Iklan"
                    placeholder="Contoh: Promo Diskon 50%"
                    value={formData.title}
                    onValueChange={(value) => setFormData({ ...formData, title: value })}
                    isRequired
                    description="Nama iklan untuk referensi admin"
                  />

                  <Select
                    label="Posisi Banner"
                    selectedKeys={[formData.position]}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                    isRequired
                  >
                    <SelectItem key="top" value="top">🔝 Top - Banner Atas</SelectItem>
                    <SelectItem key="middle" value="middle">📍 Middle - Banner Tengah</SelectItem>
                    <SelectItem key="bottom" value="bottom">⬇️ Bottom - Banner Bawah</SelectItem>
                    <SelectItem key="sidebar" value="sidebar">📌 Sidebar - Samping</SelectItem>
                  </Select>

                  <Input
                    label="URL Gambar Banner"
                    placeholder="https://example.com/banner.jpg"
                    value={formData.image_url}
                    onValueChange={(value) => setFormData({ ...formData, image_url: value })}
                    isRequired
                    description="Upload gambar ke hosting lalu paste URL-nya"
                  />

                  <Input
                    label="Link Tujuan"
                    placeholder="https://website-tujuan.com"
                    value={formData.link_url}
                    onValueChange={(value) => setFormData({ ...formData, link_url: value })}
                    description="URL yang akan dibuka saat banner diklik (opsional)"
                  />

                  <Input
                    type="date"
                    label="Tanggal Berakhir"
                    value={formData.end_date}
                    onValueChange={(value) => setFormData({ ...formData, end_date: value })}
                    description="Kosongkan jika tidak ada batas waktu"
                  />

                  <Switch
                    isSelected={formData.is_active}
                    onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                  >
                    Aktifkan iklan sekarang
                  </Switch>

                  {formData.image_url && (
                    <div>
                      <p className="text-sm text-default-500 mb-2">Preview:</p>
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="max-h-48 rounded-lg border border-default-200"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23374151' width='400' height='200'/%3E%3Ctext fill='%239CA3AF' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" type="submit" isLoading={saving}>
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
