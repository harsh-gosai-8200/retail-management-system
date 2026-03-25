import { useState } from 'react'
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

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setError(null)
    setIsLoading(true)
    try {
      await login(values)
    } catch (err: any) {
      setError(err?.message ?? 'Login failed, please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = isLoading || !form.formState.isValid

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
            Manage your wholesale business with{' '}
            <span className="text-blue-400">precision</span> and{' '}
            <span className="text-blue-400">ease</span>.
          </h2>
          <ul className="mb-10 space-y-4">
            {[
              'Real-time inventory tracking',
              'Seamless order processing',
              'Comprehensive financial reports',
              'Supplier and retailer management',
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

      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center lg:hidden">
              <div className="rounded-xl bg-blue-600 p-3 shadow-lg shadow-blue-200">
                <Store className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

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
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          to="/auth/forgot-password"
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
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
                  className="h-11 w-full bg-blue-600 shadow-md shadow-blue-200 transition-all hover:scale-[1.02] hover:bg-blue-700"
                  disabled={isDisabled}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-blue-600 transition-all hover:text-blue-700 hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
