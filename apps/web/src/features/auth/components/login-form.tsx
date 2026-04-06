"use client"

import { useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Link } from '@/i18n/routing'
import { Checkbox } from "@/components/ui/checkbox"
import { AuthLayout } from "./auth-layout"
import { useLogin } from "../hooks/use-login"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const t = useTranslations('auth.login')
  const { login, isLoading, error, fieldErrors } = useLogin()
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Sync field errors from hook to form
  useEffect(() => {
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field === 'email' || field === 'password') {
        form.setError(field as keyof LoginFormValues, {
          type: 'server',
          message,
        })
      }
    }
  }, [fieldErrors, form])

  // Sync general error from hook to form
  useEffect(() => {
    if (error) {
      form.setError("root", {
        message: error,
      })
    }
  }, [error, form])
  
  async function onSubmit(values: LoginFormValues) {
    // Clear previous errors
    form.clearErrors()
    
    await login({
      email: values.email,
      password: values.password,
    })
  }
  
  return (
    <AuthLayout>
      <Card className="border-0 shadow-none">
        <CardHeader className="space-y-1 px-0">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription className="text-base">{t('subtitle')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 px-0">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="nama@email.com" 
                        {...field} 
                        disabled={isLoading}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{t('password')}</FormLabel>
                      <Link 
                        href="/forgot-password" 
                        className="text-sm text-primary hover:underline"
                      >
                        {t('forgotPassword')}
                      </Link>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={isLoading}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {t('rememberMe')}
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.formState.errors.root && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                  {form.formState.errors.root.message}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full h-11 font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? t('processing') : t('signIn')}
              </Button>
              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">{t('noAccount')} </span>
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  {t('signUp')}
                </Link>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </AuthLayout>
  )
}

