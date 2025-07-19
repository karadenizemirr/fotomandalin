"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast/toast";
import DataTable from "@/components/organisms/datatable/Datatable";
import Form from "@/components/organisms/form/Form";
import {
  TextField,
  TextareaField,
  CheckboxField,
  NumberField,
  SelectField,
} from "@/components/organisms/form/FormField";
import { Dialog, ConfirmDialog } from "@/components/organisms/dialog";
import Upload, { UploadedFile } from "@/components/organisms/upload/Upload";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Award,
  ToggleLeft,
  ToggleRight,
  Calendar,
} from "lucide-react";
import Image from "next/image";

// Validation schemas
const staffCreateSchema = z.object({
  name: z.string().min(1, "Personel adı gereklidir"),
  email: z.string().email("Geçerli bir email adresi gereklidir"),
  phone: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  experience: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
  specialties: z.array(z.string()).default([]),
  locationId: z.string().optional(),
});

const staffUpdateSchema = staffCreateSchema.extend({
  id: z.string(),
});

type StaffFormData = z.infer<typeof staffCreateSchema>;
type StaffUpdateData = z.infer<typeof staffUpdateSchema>;

const StaffContainer = () => {
  // State
  const [_searchTerm, _setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [uploadedAvatar, setUploadedAvatar] = useState<UploadedFile | null>(
    null
  );

  // Toast hook
  const { addToast } = useToast();

  // tRPC hooks
  const {
    data: staffData,
    isLoading,
    refetch,
  } = trpc.staff.getAll.useQuery({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const { data: locationsData } = trpc.location.getAll.useQuery({
    limit: 100,
  });

  // Create mutation
  const createMutation = trpc.staff.create.useMutation();

  // Update mutation
  const updateMutation = trpc.staff.update.useMutation();

  const deleteMutation = trpc.staff.delete.useMutation();

  const toggleStatusMutation = trpc.staff.toggleStatus.useMutation();

  // Filtered data
  const filteredData = useMemo(() => {
    if (!staffData?.staff) return [];

    return staffData.staff.filter(
      (staff: any) =>
        staff.name.toLowerCase().includes(_searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(_searchTerm.toLowerCase())
    );
  }, [staffData?.staff, _searchTerm]);

  // Handle form submission for create
  const handleCreate = async (data: StaffFormData) => {
    try {
      const formattedData = {
        ...data,
        avatar: uploadedAvatar?.url || undefined,
        specialties: selectedSpecialties,
      };

      await createMutation.mutateAsync(formattedData);

      addToast({
        message: "Personel başarıyla oluşturuldu",
        type: "success",
      });
      setIsCreateModalOpen(false);
      setUploadedAvatar(null);
      setSelectedSpecialties([]);
      refetch();
      refetch();
      setUploadedAvatar(null);
    } catch (error: any) {
      addToast({
        message: error.message || "Personel oluşturulurken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle form submission for update
  const handleUpdate = async (data: StaffUpdateData) => {
    try {
      const formattedData = {
        ...data,
        avatar: uploadedAvatar?.url || selectedStaff?.avatar || undefined,
        specialties: data.specialties || [],
      };

      await updateMutation.mutateAsync(formattedData);

      addToast({
        message: "Personel başarıyla güncellendi",
        type: "success",
      });
      setIsEditModalOpen(false);
      refetch();
      setUploadedAvatar(null);
    } catch (error: any) {
      addToast({
        message: error.message || "Personel güncellenirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      if (selectedStaff) {
        await deleteMutation.mutateAsync({ id: selectedStaff.id });
        addToast({
          message: "Personel başarıyla silindi",
          type: "success",
        });
        setIsDeleteModalOpen(false);
        refetch();
      }
    } catch (error: any) {
      addToast({
        message: error.message || "Personel silinirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (staff: any) => {
    try {
      await toggleStatusMutation.mutateAsync({ id: staff.id });
      addToast({
        message: "Personel durumu güncellendi",
        type: "success",
      });
      refetch();
    } catch (error: any) {
      addToast({
        message: error.message || "Durum güncellenirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle edit
  const handleEdit = (staff: any) => {
    setSelectedStaff(staff);

    if (staff.avatar) {
      setUploadedAvatar({
        id: "avatar",
        name: "avatar",
        url: staff.avatar,
        size: 0,
        type: "image/jpeg",
        uploadedAt: new Date(),
        status: "success" as const,
      });
    }

    setIsEditModalOpen(true);
  };

  // DataTable columns
  const columns = [
    {
      key: "avatar",
      title: "Fotoğraf",
      dataIndex: "avatar",
      width: "80px",
      render: (value: string, record: any) => (
        <div className="flex items-center justify-center">
          {value ? (
            <Image
              src={value}
              alt={record.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      title: "Personel Adı",
      dataIndex: "name",
      sortable: true,
      render: (value: string, record: any) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{value}</div>
          {record.title && (
            <div className="text-sm text-gray-500">{record.title}</div>
          )}
        </div>
      ),
    },
    {
      key: "contact",
      title: "İletişim",
      width: "200px",
      render: (value: any, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Mail className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-700">{record.email}</span>
          </div>
          {record.phone && (
            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "location",
      title: "Lokasyon",
      width: "150px",
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-gray-700">
            {record.location?.name || "Atanmamış"}
          </span>
        </div>
      ),
    },
    {
      key: "experience",
      title: "Deneyim",
      width: "100px",
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-1">
          <Award className="w-4 h-4 text-purple-500" />
          <span className="text-sm text-gray-700">
            {record.experience ? `${record.experience} yıl` : "Belirtilmemiş"}
          </span>
        </div>
      ),
    },
    {
      key: "bookings",
      title: "Rezervasyonlar",
      width: "120px",
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-700">
            {record._count?.bookings || 0}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Durum",
      dataIndex: "isActive",
      width: "100px",
      render: (value: boolean, record: any) => (
        <button
          onClick={() => handleToggleStatus(record)}
          className="flex items-center space-x-1 text-sm transition-colors duration-200"
        >
          {value ? (
            <>
              <ToggleRight className="w-5 h-5 text-green-500" />
              <span className="text-green-600 font-medium">Aktif</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">Pasif</span>
            </>
          )}
        </button>
      ),
    },
  ];

  // Table actions
  const actions = [
    {
      key: "edit",
      label: "Düzenle",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record: any) => handleEdit(record),
    },
    {
      key: "delete",
      label: "Sil",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedStaff(record);
        setIsDeleteModalOpen(true);
      },
      className: "text-red-600 hover:text-red-700",
    },
  ];

  // Selected specialties state
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  // Specialty options
  const specialtyOptions = [
    "Portrait",
    "Düğün",
    "Etkinlik",
    "Ürün",
    "Mimar",
    "Moda",
    "Doğa",
    "Spor",
    "Çocuk",
    "Aile",
  ];

  // Location options
  const locationOptions = useMemo(() => {
    return (
      locationsData?.locations?.map((location: any) => ({
        value: location.id,
        label: location.name,
      })) || []
    );
  }, [locationsData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Personel Yönetimi
          </h1>
          <p className="text-gray-600">
            Fotoğraf çekimi personellerini yönetin
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yenile</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Personel</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={filteredData}
          columns={columns}
          actions={actions}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: staffData?.total || 0,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
          }}
          emptyText="Henüz personel bulunmuyor"
        />
      </div>

      {/* Create Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setUploadedAvatar(null);
          setSelectedSpecialties([]);
        }}
        title="Yeni Personel Ekle"
        description="Sisteme yeni bir personel ekleyin"
        size="lg"
      >
        <Form
          schema={staffCreateSchema}
          defaultValues={{
            name: "",
            email: "",
            phone: "",
            title: "",
            bio: "",
            experience: 0,
            isActive: true,
            specialties: [],
            locationId: "",
          }}
          onSubmit={handleCreate}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TextField
                name="name"
                label="Personel Adı"
                placeholder="Örn: Ahmet Yılmaz"
                required
              />

              <TextField
                name="email"
                label="Email Adresi"
                placeholder="ahmet@example.com"
                type="email"
                required
              />

              <TextField
                name="phone"
                label="Telefon"
                placeholder="0532 123 45 67"
              />

              <TextField
                name="title"
                label="Ünvan"
                placeholder="Örn: Fotoğrafçı, Asistan"
              />

              <NumberField
                name="experience"
                label="Deneyim (Yıl)"
                placeholder="0"
                min={0}
              />

              <SelectField
                name="locationId"
                label="Lokasyon"
                placeholder="Lokasyon seçin"
                options={[
                  { value: "", label: "Lokasyon seçin" },
                  ...locationOptions,
                ]}
              />

              <CheckboxField
                name="isActive"
                label="Aktif Durum"
                helperText="Personelin aktif olup olmadığını belirler"
              />
            </div>

            <div className="space-y-4">
              <TextareaField
                name="bio"
                label="Biyografi"
                placeholder="Personel hakkında kısa bilgi..."
                rows={3}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Profil Fotoğrafı
                </label>
                <Upload
                  multiple={false}
                  maxFiles={1}
                  onUpload={(files: UploadedFile[]) =>
                    setUploadedAvatar(files[0] || null)
                  }
                  onRemove={() => setUploadedAvatar(null)}
                  initialFiles={uploadedAvatar ? [uploadedAvatar] : []}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Uzmanlık Alanları
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <label
                      key={specialty}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        value={specialty}
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSpecialties([
                              ...selectedSpecialties,
                              specialty,
                            ]);
                          } else {
                            setSelectedSpecialties(
                              selectedSpecialties.filter((s) => s !== specialty)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
                {selectedSpecialties.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      ✓ {selectedSpecialties.length} uzmanlık alanı seçildi
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setUploadedAvatar(null);
                    setSelectedSpecialties([]);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {createMutation.isPending ? "Ekleniyor..." : "Personel Ekle"}
                </button>
              </div>
            </div>
          </div>
        </Form>
      </Dialog>

      {/* Edit Modal */}
      {selectedStaff && (
        <Dialog
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setUploadedAvatar(null);
          }}
          title="Personel Düzenle"
          description="Personel bilgilerini güncelleyin"
          size="lg"
        >
          <Form
            schema={staffUpdateSchema}
            defaultValues={{
              id: selectedStaff.id,
              name: selectedStaff.name,
              email: selectedStaff.email,
              phone: selectedStaff.phone || "",
              title: selectedStaff.title || "",
              bio: selectedStaff.bio || "",
              experience: selectedStaff.experience || 0,
              isActive: selectedStaff.isActive,
              specialties: selectedStaff.specialties || [],
              locationId: selectedStaff.locationId || "",
            }}
            onSubmit={handleUpdate}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TextField
                  name="name"
                  label="Personel Adı"
                  placeholder="Örn: Ahmet Yılmaz"
                  required
                />

                <TextField
                  name="email"
                  label="Email Adresi"
                  placeholder="ahmet@example.com"
                  type="email"
                  required
                />

                <TextField
                  name="phone"
                  label="Telefon"
                  placeholder="0532 123 45 67"
                />

                <TextField
                  name="title"
                  label="Ünvan"
                  placeholder="Örn: Fotoğrafçı, Asistan"
                />

                <NumberField
                  name="experience"
                  label="Deneyim (Yıl)"
                  placeholder="0"
                  min={0}
                />

                <SelectField
                  name="locationId"
                  label="Lokasyon"
                  placeholder="Lokasyon seçin"
                  options={[
                    { value: "", label: "Lokasyon seçin" },
                    ...locationOptions,
                  ]}
                />

                <CheckboxField
                  name="isActive"
                  label="Aktif Durum"
                  helperText="Personelin aktif olup olmadığını belirler"
                />
              </div>

              <div className="space-y-4">
                <TextareaField
                  name="bio"
                  label="Biyografi"
                  placeholder="Personel hakkında kısa bilgi..."
                  rows={3}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Profil Fotoğrafı
                  </label>
                  <Upload
                    multiple={false}
                    maxFiles={1}
                    onUpload={(files: UploadedFile[]) =>
                      setUploadedAvatar(files[0] || null)
                    }
                    onRemove={() => setUploadedAvatar(null)}
                    initialFiles={uploadedAvatar ? [uploadedAvatar] : []}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setUploadedAvatar(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {updateMutation.isPending
                    ? "Güncelleniyor..."
                    : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </div>
          </Form>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Personeli Sil"
        description={`"${selectedStaff?.name}" adlı personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="error"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default StaffContainer;
