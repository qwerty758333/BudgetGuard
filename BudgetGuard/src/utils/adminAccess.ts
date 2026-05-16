import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

function getAdminEmailsFromEnv(): string[] {
  return (
    import.meta.env.VITE_ADMIN_EMAIL?.split(',').map((email: string) =>
      email.trim().toLowerCase(),
    ) ?? []
  )
}

function hasAdminRole(user: User): boolean {
  const adminIds =
    import.meta.env.VITE_ADMIN_USER_IDS?.split(',').map((id: string) => id.trim()) ??
    []

  if (adminIds.includes(user.id)) {
    return true
  }

  const appRole = user.app_metadata?.role
  const userRole = user.user_metadata?.role

  return appRole === 'admin' || userRole === 'admin'
}

function hasAdminEmail(user: User): boolean {
  const adminEmails = getAdminEmailsFromEnv()
  if (!user.email || adminEmails.length === 0) {
    return false
  }

  return adminEmails.includes(user.email.toLowerCase())
}

/**
 * Returns true when the user has a row in public.admin_users.
 * Fails open (returns false) if the table is missing or RLS blocks access.
 */
async function hasAdminUsersRecord(user: User): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[adminAccess] admin_users lookup failed', error)
      }
      return false
    }

    return Boolean(data)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[adminAccess] admin_users lookup error', error)
    }
    return false
  }
}

/** Resolves whether a Supabase Auth user should have admin access. */
export async function resolveIsAdmin(user: User): Promise<boolean> {
  if (hasAdminRole(user) || hasAdminEmail(user)) {
    return true
  }

  return hasAdminUsersRecord(user)
}

/** Maps Supabase auth errors to clearer admin-login messages. */
export function getAdminLoginErrorMessage(
  message: string,
  status?: number,
): string {
  const normalized = message.toLowerCase()

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid email or password')
  ) {
    return (
      'Invalid email or password. Create an account on the main app first ' +
      '(same email as VITE_ADMIN_EMAIL), then try again.'
    )
  }

  if (normalized.includes('email not confirmed')) {
    return 'Email not confirmed. Check your inbox or confirm the user in Supabase Auth.'
  }

  if (status === 400) {
    return `${message} (HTTP 400 — verify the user exists in Supabase Auth → Users)`
  }

  return message
}
