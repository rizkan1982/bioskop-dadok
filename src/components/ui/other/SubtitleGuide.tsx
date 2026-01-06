'use client';

import { useState } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Subtitles, X, Settings, MessageSquare } from 'lucide-react';

interface SubtitleGuideProps {
  className?: string;
}

export default function SubtitleGuide({ className }: SubtitleGuideProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      {/* Floating Button */}
      <div className={className}>
        <Button
          variant="flat"
          startContent={<Subtitles size={18} />}
          className="bg-black/70 text-white hover:bg-black/90 backdrop-blur-sm"
          onPress={onOpen}
        >
          Subtitle
        </Button>
      </div>

      {/* Guide Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="lg"
        classNames={{
          base: "bg-zinc-900 text-white",
          header: "border-b border-zinc-700",
          body: "py-6",
          footer: "border-t border-zinc-700",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Subtitles className="text-green-500" />
              <span>Cara Mengaktifkan Subtitle</span>
            </div>
          </ModalHeader>
          
          <ModalBody>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Klik Icon Settings ⚙️</h3>
                  <p className="text-zinc-400 mt-1">
                    Cari icon gear/settings di pojok kanan bawah video player
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Pilih "Subtitles" atau "CC"</h3>
                  <p className="text-zinc-400 mt-1">
                    Klik menu subtitles/captions untuk melihat daftar bahasa
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Pilih Bahasa</h3>
                  <p className="text-zinc-400 mt-1">
                    Pilih Indonesian, English, atau bahasa lain yang tersedia
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-start gap-3">
                  <MessageSquare className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-zinc-300">
                      <strong>Info:</strong> Subtitle sudah tersedia langsung di dalam video player. 
                      Tidak perlu setting tambahan. Cukup ikuti langkah di atas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Guide */}
              <div className="bg-zinc-800 rounded-lg p-4 text-center">
                <p className="text-zinc-400 text-sm mb-3">Lokasi tombol di video player:</p>
                <div className="bg-black rounded-lg p-4 inline-flex items-center gap-4">
                  <span className="text-zinc-500">⏵ ▮▮</span>
                  <span className="text-zinc-500">🔊</span>
                  <span className="text-zinc-500">━━━━━━━━</span>
                  <span className="text-white bg-green-600 px-2 py-1 rounded text-xs animate-pulse">⚙️ ← Klik ini!</span>
                  <span className="text-zinc-500">⛶</span>
                </div>
              </div>
            </div>
          </ModalBody>
          
          <ModalFooter>
            <Button 
              color="default" 
              variant="light" 
              onPress={() => {
                setDismissed(true);
                onClose();
              }}
            >
              Jangan tampilkan lagi
            </Button>
            <Button 
              color="success" 
              onPress={onClose}
            >
              Mengerti!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
