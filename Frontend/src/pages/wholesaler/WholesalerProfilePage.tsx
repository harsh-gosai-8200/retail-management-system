import { useEffect, useState, useTransition } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Edit,
  Loader2,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { wholesalerService } from "../../services/wholesalerService";
import type {
  UpdateWholesalerDTO,
  WholesalerProfile,
} from "../../types/wholesaler";

export function WholesalerProfilePage() {
  const [profile, setProfile] = useState<WholesalerProfile | null>(null);
  const [editData, setEditData] = useState<UpdateWholesalerDTO>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const data = await wholesalerService.getProfile();
        setProfile(data);
        setEditData(data);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleUpdate = async () => {
    try {
      const updated = await wholesalerService.updateProfile(editData);
      setProfile(updated);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Update failed");
    }
  };

  const handleCancel = () => {
    if (profile) setEditData(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Wholesaler Profile
        </h1>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-md bg-gray-400 px-4 py-2 text-white"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Card */}
      <div className="rounded-2xl border bg-white shadow-sm">
        {/* Top */}
        <div className="border-b bg-slate-50 p-6 flex items-center gap-4">
          <div className="rounded-full bg-blue-100 p-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>

          <div>
            {isEditing ? (
              <input
                value={editData.username || ""}
                onChange={(e) =>
                  setEditData({ ...editData, username: e.target.value })
                }
                className="text-2xl font-bold border-b outline-none"
              />
            ) : (
              <h2 className="text-2xl font-bold">{profile.username}</h2>
            )}

            <p className="text-sm text-slate-500">{profile.email}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid gap-6 md:grid-cols-2">
          {/* LEFT */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>

            <DetailItem
              icon={Phone}
              label="Phone"
              value={isEditing ? editData.phone : profile.phone}
              editable={isEditing}
              onChange={(val) => setEditData({ ...editData, phone: val })}
            />

            <DetailItem
              icon={MapPin}
              label="Address"
              value={isEditing ? editData.address : profile.address}
              editable={isEditing}
              onChange={(val) => setEditData({ ...editData, address: val })}
            />
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            <h3 className="font-semibold">Business</h3>

            <DetailItem
              icon={Briefcase}
              label="BusinessName"
              value={isEditing ? editData.businessName : profile.businessName}
              editable={isEditing}
              onChange={(val) =>
                setEditData({ ...editData, businessName: val })
              }
            />

            <DetailItem
              icon={Briefcase}
              label="GSTNumber"
              value={isEditing ? editData.gstNumber : profile.gstNumber}
              editable={isEditing}
              onChange={(val) => setEditData({ ...editData, gstNumber: val })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🔥 Inline Detail Component (KEY DIFFERENCE) */
function DetailItem({
  icon: Icon,
  label,
  value,
  editable,
  onChange,
}: {
  icon: any;
  label: string;
  value?: string;
  editable?: boolean;
  onChange?: (val: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-1 h-4 w-4 text-slate-400" />

      <div className="flex flex-col w-full">
        {/* Label */}
        <span className="text-xs text-slate-500">{label}</span>

        {/* Value / Input */}
        {editable ? (
          <input
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            className="border-b outline-none text-slate-800"
          />
        ) : (
          <span className="text-slate-700">{value || "-"}</span>
        )}
      </div>
    </div>
  );
}
