import { useState, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Store, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
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

const registerSchema = z.object({
  username: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number'),
  role: z.enum(['WHOLESALER', 'LOCAL_SELLER']),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  shopName: z.string().optional(),
  address: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      phone: '',
      role: 'WHOLESALER',
      businessName: '',
      gstNumber: '',
      shopName: '',
      address: '',
    },
  })

  const currentRole = form.watch('role')

  const handleRoleChange = (nextRole: 'WHOLESALER' | 'LOCAL_SELLER') => {
    form.setValue('role', nextRole, { shouldValidate: true })
  }

  const onSubmit = (values: RegisterFormValues) => {
    setError(null)

    startTransition(async () => {
      try {
        await register({
          username: values.username,
          email: values.email,
          password: values.password,
          phone: values.phone,
          role: values.role,
          businessName:
            values.role === 'WHOLESALER'
              ? values.businessName || undefined
              : undefined,
          gstNumber:
            values.role === 'WHOLESALER'
              ? values.gstNumber || undefined
              : undefined,
          shopName:
            values.role === 'LOCAL_SELLER'
              ? values.shopName || undefined
              : undefined,
          address: values.address || undefined,
        })
      } catch (err: any) {
        setError(err?.message ?? 'Registration failed, please try again.')
      }
    })
  }

  const isDisabled = isPending || !form.formState.isValid

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex">
        <div className="absolute inset-0 z-0 bg-linear-to-br from-blue-600/20 to-slate-900/40" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="rounded-lg border border-white/20 bg-white/10 p-2 backdrop-blur-md">
              <Store className="h-6 w-6 text-blue-400" />
            </div>
            Retail Management
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="mb-6 text-4xl leading-tight font-bold">
            Build your wholesale setup with{' '}
            <span className="text-blue-400">clarity</span> and{' '}
            <span className="text-blue-400">control</span>.
          </h2>
          <ul className="mb-10 space-y-4">
            {[
              'Onboard wholesalers and local sellers in one flow',
              'Capture business and GST details from day one',
              'Launch with inventory, orders, and partner management',
              'Scale with role-based workflows and access control',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          © 2026 Retail Management System. All rights reserved.
        </div>
      </div>

      <div className="flex min-h-screen items-start justify-center bg-slate-50 p-6 pt-10 sm:p-10 lg:items-center lg:pt-10">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center lg:hidden">
              <div className="rounded-xl bg-blue-600 p-3 shadow-lg shadow-blue-200">
                <Store className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Choose your role and complete details to get started
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 inline-flex w-full rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() => handleRoleChange('WHOLESALER')}
                className={`flex-1 rounded-lg px-3 py-2 transition ${
                  currentRole === 'WHOLESALER'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'hover:bg-white'
                }`}
              >
                Wholesaler
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('LOCAL_SELLER')}
                className={`flex-1 rounded-lg px-3 py-2 transition ${
                  currentRole === 'LOCAL_SELLER'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'hover:bg-white'
                }`}
              >
                Local seller
              </button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Full name / business contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Eg. Sunrise Distributors"
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
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="name@example.com"
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
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          autoComplete="tel"
                          placeholder="+91 ..."
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
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="Create a strong password"
                          {...field}
                          className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                        />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                {currentRole === 'WHOLESALER' && (
                  <>
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Business name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ABC Traders Pvt Ltd"
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
                      name="gstNumber"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>GST number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="GST123456"
                              {...field}
                              className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                            />
                          </FormControl>
                          <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {currentRole === 'LOCAL_SELLER' && (
                  <FormField
                    control={form.control}
                    name="shopName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Shop name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="XYZ Kirana Store"
                            {...field}
                            className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City, State"
                          {...field}
                          className="h-11 border-slate-200 bg-slate-50 transition-all focus:bg-white"
                        />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isDisabled}
                  className="mt-2 h-11 w-full bg-blue-600 shadow-md shadow-blue-200 transition-all hover:scale-[1.02] hover:bg-blue-700"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <p className="text-center text-sm text-slate-600">
            Already registered?{' '}
            <Link
              to="/auth/login"
              className="font-semibold text-blue-600 transition-all hover:text-blue-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
