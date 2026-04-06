import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import { routing } from '@/i18n/routing'
import { isAuthenticated, getCurrentUser } from './api'
import { tokenStorage } from './token'

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname
      
      // Extract locale from pathname
      const locale = pathname.split('/')[1]
      const isValidLocale = routing.locales.includes(locale as any)
      const pathWithoutLocale = isValidLocale 
        ? pathname.replace(`/${locale}`, '') || '/'
        : pathname
      
      // Define public routes that don't require authentication
      // All other routes are considered protected
      const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
      const isPublicRoute = publicRoutes.some(route => 
        pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
      )
      const isRootPath = pathWithoutLocale === '/'
      const isOnLogin = pathWithoutLocale.startsWith('/login')
      
      // Check authentication using token storage (client-side check)
      // For server-side, we rely on NextAuth session
      // For client-side routes, we check token storage
      let isLoggedIn = !!auth?.user
      
      // If no NextAuth session but we have tokens, consider user logged in
      // This handles the case where user just logged in and tokens are stored
      if (!isLoggedIn && typeof window !== 'undefined') {
        isLoggedIn = isAuthenticated()
      }
      
      // Allow public routes and root
      if (isPublicRoute || isRootPath) {
        // Redirect logged-in users away from login/register
        if (isLoggedIn && isOnLogin) {
          const dashboardUrl = isValidLocale
            ? new URL(`/${locale}/dashboard`, nextUrl)
            : new URL('/dashboard', nextUrl)
          return Response.redirect(dashboardUrl)
        }
        return true
      }
      
      // Protect all other routes (require authentication)
      if (isLoggedIn) return true
      return false // Redirect unauthenticated users to login page
    },
  },
  providers: [], // Using token-based auth from backend, no OAuth providers needed
} satisfies NextAuthConfig

// Export auth untuk middleware
export const { auth, signIn, signOut } = NextAuth(authConfig)

// Custom signOut that also clears token storage
export async function customSignOut() {
  tokenStorage.clear()
  await signOut()
}

