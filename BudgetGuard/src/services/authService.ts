import type { Database } from '../lib/supabase'

import { createClient } from '@supabase/supabase-js'

import {

  ensureDemoLocalUser,

  getLocalSessionUser,

  getLocalUserById,

  loginLocalUser,

  logoutLocalUser,

  registerLocalUser,

  subscribeLocalAuth,

  updateLocalUserProfile,

  type AuthUser,

} from '../utils/localAuthStore'



export type { AuthUser } from '../utils/localAuthStore'



/** Standard result for auth operations. */

export interface AuthResponse {

  success: boolean

  error: string | null

  user: AuthUser | null

}



/** Result for logout (no user payload). */

export interface LogoutResponse {

  success: boolean

  error: string | null

}



const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY



function normalizeSupabaseUrl(url: string | undefined): string {

  if (!url) return ''

  return url.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')

}



const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl)



/** Optional Supabase client (analytics/admin only — auth uses localStorage). */

export const supabase = createClient<Database>(

  supabaseUrl || 'https://placeholder.supabase.co',

  supabaseKey || 'placeholder',

)



/** Judge/demo login — override via VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD in .env.local */

export const DEMO_CREDENTIALS = {

  email: (import.meta.env.VITE_DEMO_EMAIL ?? 'demo@budgetguard.app').trim().toLowerCase(),

  password: import.meta.env.VITE_DEMO_PASSWORD ?? 'demo123456',

  username: 'demo_judge',

} as const



let demoBootstrapStarted = false



function startDemoBootstrap(): void {

  if (demoBootstrapStarted || typeof window === 'undefined') return

  demoBootstrapStarted = true

  void ensureDemoLocalUser()

}



function toFriendlyErrorMessage(error: unknown, fallback: string): string {

  if (error && typeof error === 'object' && 'message' in error) {

    return String((error as { message: string }).message)

  }

  return fallback

}



/**

 * Registers a new user in localStorage (no Supabase database).

 */

export async function signUp(

  email: string,

  password: string,

  username: string,

): Promise<AuthResponse> {

  startDemoBootstrap()



  const trimmedEmail = email.trim().toLowerCase()

  const trimmedUsername = username.trim()



  if (!trimmedEmail || !password || !trimmedUsername) {

    return {

      success: false,

      error: 'Email, password, and username are required.',

      user: null,

    }

  }



  if (password.length < 6) {

    return {

      success: false,

      error: 'Password must be at least 6 characters.',

      user: null,

    }

  }



  const result = await registerLocalUser(trimmedEmail, password, trimmedUsername)

  if (!result.success) {

    return { success: false, error: result.error, user: null }

  }



  return { success: true, error: null, user: result.user }

}



/**

 * Signs in with email and password (localStorage).

 */

export async function logIn(email: string, password: string): Promise<AuthResponse> {

  startDemoBootstrap()



  const trimmedEmail = email.trim().toLowerCase()



  if (!trimmedEmail || !password) {

    return {

      success: false,

      error: 'Email and password are required.',

      user: null,

    }

  }



  if (

    trimmedEmail === DEMO_CREDENTIALS.email &&

    password === DEMO_CREDENTIALS.password

  ) {

    await ensureDemoLocalUser()

  }



  const result = await loginLocalUser(trimmedEmail, password)

  if (!result.success) {

    return { success: false, error: result.error, user: null }

  }



  return { success: true, error: null, user: result.user }

}



/**

 * Signs out the current user and clears the local session.

 */

export async function logOut(): Promise<LogoutResponse> {

  try {

    logoutLocalUser()

    return { success: true, error: null }

  } catch (error) {

    return {

      success: false,

      error: toFriendlyErrorMessage(error, 'Sign out failed. Please try again.'),

    }

  }

}



/**

 * Returns the currently signed-in user, or `null` if there is no session.

 */

export async function getCurrentUser(): Promise<AuthUser | null> {

  startDemoBootstrap()

  return getLocalSessionUser()

}



/**

 * Subscribes to auth state changes (sign-in, sign-out).

 */

export function onAuthStateChange(

  callback: (user: AuthUser | null) => void,

): () => void {

  startDemoBootstrap()

  callback(getLocalSessionUser())

  return subscribeLocalAuth(callback)

}



/**

 * Updates the user's profile in localStorage.

 */

export async function updateUserProfile(

  username: string,

  email: string,

): Promise<AuthResponse> {

  const trimmedEmail = email.trim().toLowerCase()

  const trimmedUsername = username.trim()



  if (!trimmedEmail || !trimmedUsername) {

    return {

      success: false,

      error: 'Username and email are required.',

      user: null,

    }

  }



  const current = getLocalSessionUser()

  if (!current) {

    return {

      success: false,

      error: 'You must be signed in to update your profile.',

      user: null,

    }

  }



  const result = await updateLocalUserProfile(

    current.id,

    trimmedUsername,

    trimmedEmail,

  )



  if (!result.success) {

    return { success: false, error: result.error, user: null }

  }



  return { success: true, error: null, user: result.user }

}



/**

 * Password reset is not available for local-only accounts.

 */

export async function resetPassword(email: string): Promise<AuthResponse> {

  void email

  return {

    success: false,

    error:

      'Password reset is not available for local accounts. Sign up again with a new email or use the demo login.',

    user: null,

  }

}



/** Load profile username for the profile page. */

export function getProfileForUser(userId: string, fallbackEmail: string): string {

  const user = getLocalUserById(userId)

  if (user?.username) return user.username

  const localPart = fallbackEmail.split('@')[0]

  return localPart || 'user'

}


