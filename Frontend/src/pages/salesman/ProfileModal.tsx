import { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Briefcase, CreditCard, Calendar, Edit2, Save, Loader2 } from 'lucide-react';
import type { SalesmanProfile } from '../../types/salesman';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: SalesmanProfile | null;
  onUpdate: (data: any) => Promise<void>;
  isUpdating: boolean;
}

export function ProfileModal({ isOpen, onClose, profile, onUpdate, isUpdating }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
    ...(profile?.emergencyContact !== undefined && { emergencyContact: profile.emergencyContact }),
      ...(profile?.emergencyContactName !== undefined && { emergencyContactName: profile.emergencyContactName }),
  });

  if (!isOpen || !profile) return null;

  const handleEdit = () => {
    setFormData({
      fullName: profile.fullName,
      phone: profile.phone,
      ...(profile.emergencyContact !== undefined && { emergencyContact: profile.emergencyContact }),
      ...(profile.emergencyContactName !== undefined && { emergencyContactName: profile.emergencyContactName }),
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    await onUpdate(formData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    setIsEditing(false); 
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">My Profile</h2>
          </div>
          <button onClick={handleClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                {/* <div className="rounded-full bg-blue-100 p-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div> */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900">{profile.fullName}</h3>
                  <p className="text-sm text-slate-500">{profile.employeeId} · {profile.status}</p>
                </div>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>

              {/* Profile Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{profile.phone}</span>
                    </div>
                  </div>

                  <h4 className="mt-4 font-medium text-slate-900">Work Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{profile.region}</span>
                    </div>
                    {profile.department && (
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{profile.department}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Wholesaler Information</h4>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium text-slate-500">Business:</span>
                      <span className="ml-2 text-slate-600">{profile.wholesalerName}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-slate-500">Address:</span>
                      <span className="ml-2 text-slate-600">{profile.wholesalerAddress}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-slate-500">Phone:</span>
                      <span className="ml-2 text-slate-600">{profile.wholesalerPhone}</span>
                    </div>
                  </div>

                  <h4 className="mt-4 font-medium text-slate-900">Financial Details</h4>
                  <div className="space-y-3">
                    {profile.commissionRate && (
                      <div className="flex items-center gap-3 text-sm">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">Commission: {profile.commissionRate}%</span>
                      </div>
                    )}
                    {profile.salary && (
                      <div className="flex items-center gap-3 text-sm">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">Salary: ₹{profile.salary.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{profile.assignedSellersCount}</p>
                    <p className="text-xs text-slate-500">Assigned Sellers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">Active</p>
                    <p className="text-xs text-slate-500">Status</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">Edit Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Emergency Contact Name(Optional)</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Emergency Contact Phone(Optional)</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
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