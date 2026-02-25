import * as React from 'react'
import {
  type FieldValues,
  FormProvider,
  useFormContext,
  Controller,
  type ControllerProps,
  type FieldPath,
} from 'react-hook-form'

export type FormProps<TFieldValues extends FieldValues> = {
  children: React.ReactNode
} & ReturnType<typeof useFormContext<TFieldValues>>

export function Form<TFieldValues extends FieldValues>({
  children,
  ...form
}: {
  children: React.ReactNode
} & Omit<FormProps<TFieldValues>, 'children'>) {
  return <FormProvider {...form}>{children}</FormProvider>
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return <Controller {...props} />
}

export function FormItem({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`space-y-1.5 ${className}`} {...props} />
}

export function FormLabel({
  className = '',
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block text-sm font-medium text-slate-700 ${className}`}
      {...props}
    />
  )
}

export function FormControl({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />
}

export function FormMessage({
  children,
}: {
  children?: React.ReactNode
}) {
  if (!children) return null
  return <p className="text-xs text-red-600">{children}</p>
}

