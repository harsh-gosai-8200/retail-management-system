import { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  Store,
  Edit2,
  Save,
  Loader2,
  Mail,
  AlertCircle,
} from "lucide-react";
import { sellerService } from "../../services/sellerService";
import type { SellerProfile, UpdateSellerDTO } from "../../types/Seller";
import { useNavigate } from "react-router-dom";

export function LocalSellerProfilePage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [formData, setFormData] = useState<UpdateSellerDTO>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
   const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await sellerService.getProfile();
        setProfile(data);
        setFormData(data);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const updated = await sellerService.updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) setFormData(profile);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Local Seller Profile
            </h2>
          </div>
          <button
           onClick={() => navigate(-1)}
            className="rounded-lg p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error || !profile ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error || "Profile not found"}
              </div>
            </div>
          ) : !isEditing ? (
            // View Mode
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {profile.username}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>

              {/* Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <DetailItem icon={Phone} label="Phone" value={profile.phone} />
                <DetailItem icon={MapPin} label="Address" value={profile.address} />
                <DetailItem icon={Store} label="Shop Name" value={profile.shopName} />
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit Profile
              </h3>

              <div className="space-y-4">
                <InputField
                  label="Username"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Shop Name"
                  name="shopName"
                  value={formData.shopName || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-slate-400" />
      <span className="text-slate-700">
        <span className="font-medium text-slate-500">{label}:</span> {value || "-"}
      </span>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}