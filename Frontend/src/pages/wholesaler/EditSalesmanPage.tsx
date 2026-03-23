import { useState, useEffect, useTransition } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  User,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { salesmanService } from '../../services/salesmanService'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'

const phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/u

// Schema matches exactly what can be updated (without emergency contacts)
const editSalesmanSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
  region: z.string().min(1, 'Region is required').optional(),
  department: z.string().optional(),
  commissionRate: z.string().optional(),
  salary: z.string().optional(),
})

type EditSalesmanFormValues = z.infer<typeof editSalesmanSchema>

export function EditSalesmanPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [salesman, setSalesman] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<EditSalesmanFormValues>({
    resolver: zodResolver(editSalesmanSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      region: '',
      department: '',
      commissionRate: '',
      salary: '',
    },
  })

  useEffect(() => {
    if (user?.id && id) {
      loadSalesmanData()
    }
  }, [user?.id, id])

  const loadSalesmanData = async () => {
    try {
      const data = await salesmanService.getSalesman(user?.id!, parseInt(id!))
      setSalesman(data)
      
      // Populate form with existing data - NO emergency contact fields
      form.reset({
        fullName: data.fullName,
        phone: data.phone,
        region: data.region,
        department: data.department || '',
        commissionRate: data.commissionRate?.toString() || '',
        salary: data.salary?.toString() || '',
      })
      
      setError(null)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load salesman data')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (values: EditSalesmanFormValues) => {
    setError(null)
    setSuccess(null)
    setSaving(true)

    // Only send fields that have values
    const updateData: any = {}
    if (values.fullName) updateData.fullName = values.fullName
    if (values.phone) updateData.phone = values.phone
    if (values.region) updateData.region = values.region
    if (values.department) updateData.department = values.department
    if (values.commissionRate) updateData.commissionRate = parseFloat(values.commissionRate)
    if (values.salary) updateData.salary = parseFloat(values.salary)

    salesmanService.updateSalesman(user?.id!, parseInt(id!), updateData)
      .then(() => {
        setSuccess('Salesman updated successfully!')
        setTimeout(() => navigate('/wholesaler/salesmen'), 2000)
      })
      .catch((err: any) => {
        setError(err?.message ?? 'Failed to update salesman')
      })
      .finally(() => {
        setSaving(false)
      })
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/wholesaler/salesmen')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Salesmen
          </button>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Salesman</h1>
          </div>
        </div>

        {/* Read-only Info Card */}
        {salesman && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-500">Employee ID:</span>
                <span className="ml-2 text-slate-900">{salesman.employeeId}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500">Email:</span>
                <span className="ml-2 text-slate-900">{salesman.email}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500">Aadhar:</span>
                <span className="ml-2 text-slate-900">{salesman.aadharNumber || 'Not provided'}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500">PAN:</span>
                <span className="ml-2 text-slate-900">{salesman.panNumber || 'Not provided'}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500">Joining Date:</span>
                <span className="ml-2 text-slate-900">
                  {salesman.joiningDate ? new Date(salesman.joiningDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Edit Form - Only updatable fields */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Edit Information</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid gap-4 md:grid-cols-2">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Rahul Sharma"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 pl-9 transition-all focus:bg-white"
                          />
                        </div>
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="9876543210"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 pl-9 transition-all focus:bg-white"
                          />
                        </div>
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                {/* Region */}
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="North Zone"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 pl-9 transition-all focus:bg-white"
                          />
                        </div>
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                {/* Department */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Field Sales"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 pl-9 transition-all focus:bg-white"
                          />
                        </div>
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                {/* Commission Rate */}
                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Commission rate (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="2.5"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 pl-9 transition-all focus:bg-white"
                          />
                        </div>
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                {/* Salary */}
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Salary (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type="number"
                            placeholder="25000"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 pl-9 transition-all focus:bg-white"
                          />
                        </div>
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={saving}
                className="mt-8 h-11 w-full bg-blue-600 shadow-md shadow-blue-200 transition-all hover:scale-[1.02] hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating salesman...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Update Salesman
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}