import { useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  UserPlus, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  User,
  CreditCard,
  AlertCircle,
  Calendar
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

const salesmanSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number'),
  region: z.string().min(1, 'Region is required'),
  department: z.string().optional(),
  employeeId: z.string().optional(),
  commissionRate: z.string().optional(),
  salary: z.string().optional(),
  aadharNumber: z.string().optional(),
  panNumber: z.string().optional(),
  emergencyContact: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
  emergencyContactName: z.string().optional(),
  joiningDate: z.string().optional(),
})

type SalesmanFormValues = z.infer<typeof salesmanSchema>

export function CreateSalesmanPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<SalesmanFormValues>({
    resolver: zodResolver(salesmanSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      region: '',
      department: '',
      employeeId: '',
      commissionRate: '',
      salary: '',
      aadharNumber: '',
      panNumber: '',
      emergencyContact: '',
      emergencyContactName: '',
      joiningDate: '',
    },
  })

  const onSubmit = (values: SalesmanFormValues) => {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      try {
        const wholesalerId = user?.id
        
        await salesmanService.createSalesman(wholesalerId!, {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          region: values.region,
          department: values.department || undefined,
          employeeId: values.employeeId || undefined,
          commissionRate: values.commissionRate ? parseFloat(values.commissionRate) : undefined,
          salary: values.salary ? parseFloat(values.salary) : undefined,
          aadharNumber: values.aadharNumber || undefined,
          panNumber: values.panNumber || undefined,
          emergencyContact: values.emergencyContact || undefined,
          emergencyContactName: values.emergencyContactName || undefined,
          joiningDate: values.joiningDate ? new Date(values.joiningDate) : undefined,
        })
        
        setSuccess('Salesman created successfully!')
        setTimeout(() => navigate('/wholesaler/salesmen'), 2000)
      } catch (err: any) {
        setError(err?.message ?? 'Failed to create salesman, please try again.')
      }
    })
  }

  const isDisabled = isPending || !form.formState.isValid

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
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Salesman</h1>
          </div>
        </div>

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

        {/* Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
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

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              type="email"
                              placeholder="rahul.sales@example.com"
                              {...field}
                              className="h-11 border-slate-200 bg-slate-50 pl-9 transition-all focus:bg-white"
                            />
                          </div>
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />

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

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a strong password"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Work Info */}
              <div className="space-y-4 border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-900">Work Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
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

                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Auto-generated if empty"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="joiningDate"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Joining Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              type="date"
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
              </div>

              {/* Financial Details */}
              <div className="space-y-4 border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-900">Financial Details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="commissionRate"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Commission rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="2.5"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Salary (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="25000"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4 border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-900">Personal Details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="aadharNumber"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Aadhar number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1234 5678 9012"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="panNumber"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>PAN number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ABCDE1234F"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4 border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-900">Emergency Contact</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Contact name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Priya Sharma"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Contact phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="9876543211"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button - exactly like your RegisterPage */}
              <Button
                type="submit"
                disabled={isDisabled}
                className="mt-8 h-11 w-full bg-blue-600 shadow-md shadow-blue-200 transition-all hover:scale-[1.02] hover:bg-blue-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating salesman...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create salesman
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