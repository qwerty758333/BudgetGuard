import { createClient, type AuthChangeEvent, type User } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase'

/** Authenticated user exposed to the app layer. */
export interface AuthUser {
  id: string
  email: string
  created_at: string
}

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

/** Shared Supabase client for authentication and profile operations. */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder',
)

/**
 * Maps a Supabase Auth user to {@link AuthUser}.
 */
function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    created_at: user.created_at,
  }
}

/**
 * Returns a safe, user-facing error message (no sensitive internals).
 */
function toFriendlyErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: string }).message)
    const normalized = message.toLowerCase()

    if (
      normalized.includes('invalid login credentials') ||
      normalized.includes('invalid email or password')
    ) {
      return 'Invalid email or password. Please try again.'
    }

    if (normalized.includes('user already registered')) {
      return 'An account with this email already exists. Try signing in instead.'
    }

    if (normalized.includes('email not confirmed')) {
      return 'Please confirm your email before signing in.'
    }

    if (normalized.includes('password should be at least')) {
      return 'Password must be at least 6 characters.'
    }

    if (normalized.includes('unable to validate email')) {
      return 'Please enter a valid email address.'
    }

    if (normalized.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.'
    }

    return message
  }

  return fallback
}

/**
 * Registers a new user and creates their profile in `public.users`.
 */
export async function signUp(
  email: string,
  password: string,
  username: string,
): Promise<AuthResponse> {
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedUsername = username.trim()

  if (!trimmedEmail || !password || !trimmedUsername) {
    return {
      success: false,
      error: 'Email, password, and username are required.',
      user: null,
    }
  }

  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { username: trimmedUsername },
      },
    })

    if (signUpError) {
      return {
        success: false,
        error: toFriendlyErrorMessage(signUpError, 'Sign up failed. Please try again.'),
        user: null,
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Sign up failed. No user was returned.',
        user: null,
      }
    }

    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email: trimmedEmail,
      username: trimmedUsername,
    })

    if (profileError) {
      return {
        success: false,
        error: toFriendlyErrorMessage(
          profileError,
          'Account created, but profile setup failed. Please contact support.',
        ),
        user: null,
      }
    }

    return {
      success: true,
      error: null,
      user: toAuthUser(data.user),
    }
  } catch (error) {
    return {
      success: false,
      error: toFriendlyErrorMessage(error, 'Sign up failed. Please try again.'),
      user: null,
    }
  }
}

/**
 * Signs in with email and password.
 */
export async function logIn(email: string, password: string): Promise<AuthResponse> {
  const trimmedEmail = email.trim().toLowerCase()

  if (!trimmedEmail || !password) {
    return {
      success: false,
      error: 'Email and password are required.',
      user: null,
    }
  }

  try {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (signInError) {
      return {
        success: false,
        error: toFriendlyErrorMessage(signInError, 'Sign in failed. Please try again.'),
        user: null,
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Sign in failed. No session was created.',
        user: null,
      }
    }

    return {
      success: true,
      error: null,
      user: toAuthUser(data.user),
    }
  } catch (error) {
    return {
      success: false,
      error: toFriendlyErrorMessage(error, 'Sign in failed. Please try again.'),
      user: null,
    }
  }
}

/**
 * Signs out the current user and clears the local session.
 */
export async function logOut(): Promise<LogoutResponse> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: toFriendlyErrorMessage(error, 'Sign out failed. Please try again.'),
      }
    }

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
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session?.user) {
      return null
    }

    return toAuthUser(session.user)
  } catch {
    return null
  }
}

/**
 * Subscribes to auth state changes (sign-in, sign-out, token refresh).
 * @returns Unsubscribe function — call it on cleanup.
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
    callback(session?.user ? toAuthUser(session.user) : null)
  })

  return () => {
    subscription.unsubscribe()
  }
}

/**
 * Updates the user's profile in `public.users`.
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

  try {
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return {
        success: false,
        error: 'You must be signed in to update your profile.',
        user: null,
      }
    }

    const { error: profileError } = await supabase
      .from('users')
      .update({ email: trimmedEmail, username: trimmedUsername })
      .eq('id', user.id)

    if (profileError) {
      return {
        success: false,
        error: toFriendlyErrorMessage(
          profileError,
          'Could not update profile. Please try again.',
        ),
        user: null,
      }
    }

    const { error: authUpdateError } = await supabase.auth.updateUser({
      email: trimmedEmail,
      data: { username: trimmedUsername },
    })

    if (authUpdateError) {
      return {
        success: false,
        error: toFriendlyErrorMessage(
          authUpdateError,
          'Profile saved locally, but email update requires confirmation.',
        ),
        user: toAuthUser(user),
      }
    }

    const {
      data: { user: refreshedUser },
    } = await supabase.auth.getUser()

    return {
      success: true,
      error: null,
      user: refreshedUser ? toAuthUser(refreshedUser) : toAuthUser(user),
    }
  } catch (error) {
    return {
      success: false,
      error: toFriendlyErrorMessage(error, 'Could not update profile. Please try again.'),
      user: null,
    }
  }
}

/**
 * Sends a password reset email to the given address.
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  const trimmedEmail = email.trim().toLowerCase()

  if (!trimmedEmail) {
    return {
      success: false,
      error: 'Email is required.',
      user: null,
    }
  }

  try {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/`
        : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
    })

    if (error) {
      return {
        success: false,
        error: toFriendlyErrorMessage(
          error,
          'Could not send reset email. Please try again.',
        ),
        user: null,
      }
    }

    return {
      success: true,
      error: null,
      user: null,
    }
  } catch (error) {
    return {
      success: false,
      error: toFriendlyErrorMessage(
        error,
        'Could not send reset email. Please try again.',
      ),
      user: null,
    }
  }
}
