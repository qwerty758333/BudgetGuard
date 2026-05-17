const DEMO_EMAIL = (
  import.meta.env.VITE_DEMO_EMAIL ?? 'demo@budgetguard.app'
).trim().toLowerCase()
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? 'demo123456'
const DEMO_USERNAME = 'demo_judge'

export interface LocalAuthUser {
  id: string
  email: string
  username: string
  passwordHash: string
  salt: string
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  username: string
  created_at: string
}

const USERS_KEY = 'budgetguard_local_users'
const SESSION_KEY = 'budgetguard_local_session'

type AuthListener = (user: AuthUser | null) => void
const listeners = new Set<AuthListener>()

function storageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false
    const test = '__budgetguard_auth_test__'
    window.localStorage.setItem(test, '1')
    window.localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

function readUsers(): LocalAuthUser[] {
  if (!storageAvailable()) return []
  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    const parsed = JSON.parse(raw || '[]') as LocalAuthUser[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUsers(users: LocalAuthUser[]): void {
  if (!storageAvailable()) return
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {
    // ignore
  }
}

function toAuthUser(record: LocalAuthUser): AuthUser {
  return {
    id: record.id,
    email: record.email,
    username: record.username,
    created_at: record.created_at,
  }
}

function notify(user: AuthUser | null): void {
  listeners.forEach((listener) => listener(user))
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function readSessionUserId(): string | null {
  if (!storageAvailable()) return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { userId?: string }
    return typeof parsed.userId === 'string' ? parsed.userId : null
  } catch {
    return null
  }
}

function writeSession(userId: string | null): void {
  if (!storageAvailable()) return
  try {
    if (!userId) {
      window.localStorage.removeItem(SESSION_KEY)
      return
    }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }))
  } catch {
    // ignore
  }
}

export function subscribeLocalAuth(listener: AuthListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getLocalSessionUser(): AuthUser | null {
  const userId = readSessionUserId()
  if (!userId) return null
  const record = readUsers().find((user) => user.id === userId)
  return record ? toAuthUser(record) : null
}

export function getLocalUserById(userId: string): AuthUser | null {
  const record = readUsers().find((user) => user.id === userId)
  return record ? toAuthUser(record) : null
}

export async function registerLocalUser(
  email: string,
  password: string,
  username: string,
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  if (!storageAvailable()) {
    return { success: false, error: 'Local storage is not available in this browser.' }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim()
  const users = readUsers()

  if (users.some((user) => user.email === normalizedEmail)) {
    return {
      success: false,
      error: 'An account with this email already exists. Try signing in instead.',
    }
  }

  const salt = crypto.randomUUID()
  const passwordHash = await hashPassword(password, salt)
  const record: LocalAuthUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    username: normalizedUsername,
    passwordHash,
    salt,
    created_at: new Date().toISOString(),
  }

  writeUsers([...users, record])
  writeSession(record.id)
  const user = toAuthUser(record)
  notify(user)
  return { success: true, user }
}

export async function loginLocalUser(
  email: string,
  password: string,
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  if (!storageAvailable()) {
    return { success: false, error: 'Local storage is not available in this browser.' }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const record = readUsers().find((user) => user.email === normalizedEmail)

  if (!record) {
    return { success: false, error: 'Invalid email or password. Please try again.' }
  }

  const passwordHash = await hashPassword(password, record.salt)
  if (passwordHash !== record.passwordHash) {
    return { success: false, error: 'Invalid email or password. Please try again.' }
  }

  writeSession(record.id)
  const user = toAuthUser(record)
  notify(user)
  return { success: true, user }
}

export function logoutLocalUser(): void {
  writeSession(null)
  notify(null)
}

export async function updateLocalUserProfile(
  userId: string,
  username: string,
  email: string,
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim()
  const users = readUsers()
  const index = users.findIndex((user) => user.id === userId)

  if (index < 0) {
    return { success: false, error: 'Account not found on this device.' }
  }

  if (
    users.some(
      (user, i) => i !== index && user.email === normalizedEmail,
    )
  ) {
    return {
      success: false,
      error: 'Another account on this device already uses that email.',
    }
  }

  const updated: LocalAuthUser = {
    ...users[index],
    email: normalizedEmail,
    username: normalizedUsername,
  }
  const next = [...users]
  next[index] = updated
  writeUsers(next)

  const user = toAuthUser(updated)
  if (readSessionUserId() === userId) {
    notify(user)
  }
  return { success: true, user }
}

/** Ensures the demo judge account exists for one-click login. */
export async function ensureDemoLocalUser(): Promise<void> {
  const users = readUsers()
  if (users.some((user) => user.email === DEMO_EMAIL)) return
  await registerLocalUser(DEMO_EMAIL, DEMO_PASSWORD, DEMO_USERNAME)
  logoutLocalUser()
}
