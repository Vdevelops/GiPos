"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Link, useRouter } from '@/i18n/routing'
import { Checkbox } from "@/components/ui/checkbox"
import { AuthLayout } from "./auth-layout"

const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const t = useTranslations('auth.register')
  const tErrors = useTranslations('auth.errors')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  })
  
  async function onSubmit() {
    setIsLoading(true)
    try {
      // TODO: Implement registration with Golang backend
      // Currently simulated - will be integrated with backend later
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to dashboard on success
      // Note: Authentication will be handled by Golang backend via NextAuth
      router.push('/dashboard')
    } catch {
      form.setError("root", {
        message: tErrors('somethingWentWrong'),
      })
    } finally {
      setIsLoading(false)
    }
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fullName')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="John Doe" 
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
                    <FormLabel>{t('password')}</FormLabel>
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirmPassword')}</FormLabel>
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
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal cursor-pointer text-sm">
                        {t('agreeToTerms')}{' '}
                        <Link href="/terms" className="text-primary hover:underline">
                          {t('termsAndConditions')}
                        </Link>
                        {' '}{t('and')}{' '}
                        <Link href="/privacy" className="text-primary hover:underline">
                          {t('privacyPolicy')}
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
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
                {isLoading ? "Memproses..." : t('createAccount')}
              </Button>
              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  {t('signIn')}
                </Link>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </AuthLayout>
  )
}
