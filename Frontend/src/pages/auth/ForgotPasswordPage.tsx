import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setIsLoading(true);
    setError(null);
    setEmail(values.email);
    
    try {
      await api.request('/auth/forgot-password', {
        method: 'POST',
        data: { email: values.email },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Check Your Email</h2>
            <p className="mt-2 text-sm text-slate-600">
              We've sent a password reset OTP to <strong>{email}</strong>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              The OTP is valid for 10 minutes.
            </p>
            <div className="mt-6 space-y-3">
              <Button
                onClick={() => navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Enter OTP
              </Button>
              <Button
                variant="outline"
                onClick={() => setSuccess(false)}
                className="w-full"
              >
                Resend OTP
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Forgot Password?</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="h-11 pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send Reset OTP'
              )}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Remember your password?{' '}
              <Link to="/auth/login" className="font-medium text-blue-600 hover:underline">
                Back to Login
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}