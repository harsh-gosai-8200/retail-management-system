import { useState, useEffect, useTransition } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  Edit2,
  Save,
  Loader2,
} from "lucide-react";
import { wholesalerService } from "../../services/wholesalerService";
import type { WholesalerProfile } from "../../types/wholesaler";

export function WholesalerProfilePage() {
  const [profile, setProfile] = useState<WholesalerProfile | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
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
        setFormData({
          username: data.username || "",
          phone: data.phone || "",
          address: data.address || "",
          businessName: data.businessName || "",
          gstNumber: data.gstNumber || "",
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    if (profile) setFormData(profile);
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const updated = await wholesalerService.updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">My Profile</h2>
          </div>
          <button
            onClick={() => window.history.back()}
            className="rounded-lg p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isEditing ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {profile.username}
                  </h3>
                  <p className="text-sm text-slate-500">{profile.businessName}</p>
                </div>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Contact Information</h4>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" /> {profile.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" /> {profile.phone}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Business Details</h4>
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-slate-400" />{" "}
                    {profile.businessName}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400" /> {profile.address}
                  </div>
                  {profile.gstNumber && (
                    <div className="flex items-center gap-3 text-sm">
                      <CreditCard className="h-4 w-4 text-slate-400" /> GST:{" "}
                      {profile.gstNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">Edit Profile</h3>
              <div className="space-y-4">
                {["username", "phone", "address", "businessName", "gstNumber"].map(
                  (field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-slate-700">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={formData[field] || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )
                )}
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
                  disabled={isUpdating}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUpdating ? (
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