"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import { Dialog } from "@/components/organisms/dialog";
import Form from "@/components/organisms/form/Form";
import {
  TextField,
  TextareaField,
} from "@/components/organisms/form/FormField";
import { z } from "zod";
import {
  Mail,
  Phone,
  Calendar,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";

// Status update schema
const statusUpdateSchema = z.object({
  status: z.enum(["PENDING", "REPLIED", "RESOLVED"]),
  adminNotes: z.string().optional(),
});

type ContactMessageStatus = "PENDING" | "REPLIED" | "RESOLVED";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  adminNotes?: string | null;
  submittedAt: string;
  repliedAt?: string | null;
  updatedAt: string;
}

export default function ContactMessagesContainer() {
  const { addToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<
    ContactMessageStatus | "ALL"
  >("ALL");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Fetch contact messages
  const {
    data: messagesData,
    isLoading,
    refetch,
  } = trpc.contact.getMessages.useQuery({
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    limit: 50,
  });

  // Update status mutation
  const updateStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Mesaj durumu güncellendi",
        type: "success",
      });
      setShowStatusDialog(false);
      setSelectedMessage(null);
      refetch();
    },
    onError: (error: any) => {
      addToast({
        title: "Hata",
        message: error.message,
        type: "error",
      });
    },
  });

  const handleStatusUpdate = (data: z.infer<typeof statusUpdateSchema>) => {
    if (!selectedMessage) return;

    updateStatusMutation.mutate({
      id: selectedMessage.id,
      status: data.status,
      adminNotes: data.adminNotes,
    });
  };

  const getStatusIcon = (status: ContactMessageStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "REPLIED":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: ContactMessageStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "REPLIED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getStatusText = (status: ContactMessageStatus) => {
    switch (status) {
      case "PENDING":
        return "Bekliyor";
      case "REPLIED":
        return "Yanıtlandı";
      case "RESOLVED":
        return "Çözüldü";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const messages = messagesData?.messages || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">
              İletişim Mesajları
            </h1>
            <p className="text-gray-600 mt-2">
              Müşterilerden gelen iletişim mesajlarını görüntüleyin ve yönetin
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Durum:</span>
            </div>
            <div className="flex gap-2">
              {(["ALL", "PENDING", "REPLIED", "RESOLVED"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {status === "ALL" ? "Tümü" : getStatusText(status)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Mesaj Bulunamadı
              </h3>
              <p className="text-gray-600">
                {selectedStatus === "ALL"
                  ? "Henüz hiç iletişim mesajı gelmemiş."
                  : `${getStatusText(
                      selectedStatus as ContactMessageStatus
                    )} durumunda mesaj bulunamadı.`}
              </p>
            </div>
          ) : (
            messages.map((message: any) => (
              <div
                key={message.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-black">
                        {message.subject}
                      </h3>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          message.status
                        )}`}
                      >
                        {getStatusIcon(message.status)}
                        {getStatusText(message.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{message.name}</span>
                        <span className="text-gray-400">•</span>
                        <span>{message.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{message.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(message.submittedAt).toLocaleDateString(
                            "tr-TR"
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 line-clamp-2 mb-4">
                      {message.message}
                    </p>

                    {message.adminNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Admin Notları:
                        </p>
                        <p className="text-sm text-blue-800">
                          {message.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setShowStatusDialog(false);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Detayları Görüntüle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setShowStatusDialog(true);
                      }}
                      className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Durum Güncelle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail Dialog */}
        {selectedMessage && !showStatusDialog && (
          <Dialog
            isOpen={true}
            onClose={() => setSelectedMessage(null)}
            title="Mesaj Detayları"
            description="İletişim mesajının detaylı görünümü"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Ad Soyad
                  </label>
                  <p className="text-black mt-1">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    E-posta
                  </label>
                  <p className="text-black mt-1">{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <p className="text-black mt-1">{selectedMessage.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Durum
                  </label>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(
                      selectedMessage.status
                    )}`}
                  >
                    {getStatusIcon(selectedMessage.status)}
                    {getStatusText(selectedMessage.status)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Konu
                </label>
                <p className="text-black mt-1">{selectedMessage.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Mesaj
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-1">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {selectedMessage.adminNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Admin Notları
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-1">
                    <p className="text-blue-800">
                      {selectedMessage.adminNotes}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Gönderilme Tarihi
                  </label>
                  <p className="text-black mt-1">
                    {new Date(selectedMessage.submittedAt).toLocaleString(
                      "tr-TR"
                    )}
                  </p>
                </div>
                {selectedMessage.repliedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Yanıtlanma Tarihi
                    </label>
                    <p className="text-black mt-1">
                      {new Date(selectedMessage.repliedAt).toLocaleString(
                        "tr-TR"
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                >
                  Kapat
                </button>
                <button
                  onClick={() => setShowStatusDialog(true)}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Durum Güncelle
                </button>
              </div>
            </div>
          </Dialog>
        )}

        {/* Status Update Dialog */}
        {selectedMessage && showStatusDialog && (
          <Dialog
            isOpen={true}
            onClose={() => {
              setShowStatusDialog(false);
              setSelectedMessage(null);
            }}
            title="Mesaj Durumunu Güncelle"
            description="Mesajın durumunu ve admin notlarını güncelleyin"
          >
            <div className="pt-4">
              <Form
                schema={statusUpdateSchema}
                onSubmit={handleStatusUpdate}
                defaultValues={{
                  status: selectedMessage.status,
                  adminNotes: selectedMessage.adminNotes || "",
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    defaultValue={selectedMessage.status}
                  >
                    <option value="PENDING">Bekliyor</option>
                    <option value="REPLIED">Yanıtlandı</option>
                    <option value="RESOLVED">Çözüldü</option>
                  </select>
                </div>

                <TextareaField
                  name="adminNotes"
                  label="Admin Notları"
                  placeholder="Bu mesaj hakkında notlarınızı yazın..."
                  rows={4}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStatusDialog(false);
                      setSelectedMessage(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={updateStatusMutation.isPending}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {updateStatusMutation.isPending
                      ? "Güncelleniyor..."
                      : "Güncelle"}
                  </button>
                </div>
              </Form>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
}
