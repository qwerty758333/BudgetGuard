import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { resolveIsAdmin } from '../utils/adminAccess'

/** Supported analytics event names. */
export type AnalyticsEventType =
  | 'expense_added'
  | 'badge_earned'
  | 'ai_used'
  | 'expense_deleted'
  | 'dark_mode_toggled'

/** Payload stored with each analytics event. */
export interface AnalyticsEvent {
  event_type: AnalyticsEventType | string
  event_data: Record<string, unknown>
  user_id?: string
}

type EventsRow = {
  id: string
  event_type: string
  event_data: Record<string, unknown>
  user_id: string
  created_at: string
}

type AnalyticsDatabase = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          user_id: string
          email: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string | null
          role?: string | null
          created_at?: string
        }
        Relationships: []
      }
      events: {
        Row: EventsRow
        Insert: {
          id?: string
          event_type: string
          event_data: Record<string, unknown>
          user_id?: string
          created_at?: string
        }
        Update: Partial<EventsRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type TrackEventResult =
  | { success: true }
  | { success: false; error: string }

export type EventStatsResult =
  | { success: true; totalEvents: number; byType: Record<string, number> }
  | { success: false; error: string }

export type AdminEventRow = EventsRow

export interface AdminAnalytics {
  totalEvents: number
  byType: Record<string, number>
  recentEvents: AdminEventRow[]
  eventsPerHourToday: Array<{ label: string; count: number }>
  mostCommonEventType: string
  uniqueUserCount: number
  timeSeries24h: Array<{ label: string; count: number }>
  allEvents: AdminEventRow[]
}

export type AdminAccessResult = {
  authenticated: boolean
  isAdmin: boolean
  error?: string
}

export type FetchAdminAnalyticsResult =
  | { success: true; data: AdminAnalytics }
  | { success: false; error: string }

export type ClearOldEventsResult =
  | { success: true; deletedCount: number }
  | { success: false; error: string }

const TRACKED_EVENT_TYPES: AnalyticsEventType[] = [
  'expense_added',
  'badge_earned',
  'ai_used',
  'expense_deleted',
  'dark_mode_toggled',
]

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = Boolean(supabaseUrl && supabaseKey)

let analyticsClient: SupabaseClient<AnalyticsDatabase> | null = null

function normalizeSupabaseUrl(url: string | undefined): string {
  if (!url) return ''
  return url.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '')
}

function getClient(): SupabaseClient<AnalyticsDatabase> | null {
  if (!isConfigured) return null
  if (!analyticsClient) {
    analyticsClient = createClient<AnalyticsDatabase>(supabaseUrl, supabaseKey)
  }
  return analyticsClient
}

function logAnalyticsError(message: string, error?: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[analytics] ${message}`, error)
  }
}

/** Returns true when the current session belongs to an admin user. */
async function isAuthenticatedAdmin(
  client: SupabaseClient<AnalyticsDatabase>,
): Promise<boolean> {
  try {
    const {
      data: { session },
      error,
    } = await client.auth.getSession()

    if (error || !session?.user) {
      return false
    }

    return resolveIsAdmin(session.user)
  } catch (error) {
    logAnalyticsError('Failed to verify admin session', error)
    return false
  }
}

/**
 * Records an analytics event in Supabase.
 * Fails gracefully when offline, misconfigured, or the insert errors.
 *
 * @param type - Event name (e.g. `expense_added`)
 * @param data - Event-specific metadata
 * @param userId - Optional user id; defaults to `anonymous`
 */
export async function trackEvent(
  type: string,
  data: object,
  userId?: string,
): Promise<TrackEventResult> {
  const client = getClient()
  if (!client) {
    return { success: false, error: 'Analytics is not configured' }
  }

  const event: AnalyticsEvent = {
    event_type: type,
    event_data: data as Record<string, unknown>,
    user_id: userId ?? 'anonymous',
  }

  try {
    const { error } = await client.from('events').insert({
      event_type: event.event_type,
      event_data: event.event_data,
      user_id: event.user_id,
    })

    if (error) {
      logAnalyticsError('trackEvent insert failed', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown analytics error'
    logAnalyticsError('trackEvent network failure', error)
    return { success: false, error: message }
  }
}

/**
 * Fetches aggregate analytics stats from Supabase.
 * Only available to authenticated admin users.
 */
export async function getEventStats(): Promise<EventStatsResult> {
  const client = getClient()
  if (!client) {
    return { success: false, error: 'Analytics is not configured' }
  }

  const isAdmin = await isAuthenticatedAdmin(client)
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: admin access required' }
  }

  try {
    const { count, error: countError } = await client
      .from('events')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      logAnalyticsError('getEventStats count failed', countError)
      return { success: false, error: countError.message }
    }

    const { data, error: listError } = await client
      .from('events')
      .select('event_type')

    if (listError) {
      logAnalyticsError('getEventStats list failed', listError)
      return { success: false, error: listError.message }
    }

    const byType: Record<string, number> = {}
    for (const row of data ?? []) {
      byType[row.event_type] = (byType[row.event_type] ?? 0) + 1
    }

    return {
      success: true,
      totalEvents: count ?? 0,
      byType,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown analytics error'
    logAnalyticsError('getEventStats network failure', error)
    return { success: false, error: message }
  }
}

function buildEmptyByType(): Record<string, number> {
  return TRACKED_EVENT_TYPES.reduce<Record<string, number>>((acc, type) => {
    acc[type] = 0
    return acc
  }, {})
}

function computeAdminAnalytics(events: AdminEventRow[]): AdminAnalytics {
  const byType = buildEmptyByType()
  const userIds = new Set<string>()
  const now = Date.now()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todayStartMs = startOfToday.getTime()
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000

  const eventsPerHourTodayMap = new Map<number, number>()
  const timeSeries24hMap = new Map<number, number>()

  for (const event of events) {
    byType[event.event_type] = (byType[event.event_type] ?? 0) + 1
    userIds.add(event.user_id)

    const createdMs = new Date(event.created_at).getTime()
    if (createdMs >= todayStartMs) {
      const hour = new Date(createdMs).getHours()
      eventsPerHourTodayMap.set(hour, (eventsPerHourTodayMap.get(hour) ?? 0) + 1)
    }

    if (createdMs >= twentyFourHoursAgo) {
      const bucket = Math.floor(createdMs / (60 * 60 * 1000))
      timeSeries24hMap.set(bucket, (timeSeries24hMap.get(bucket) ?? 0) + 1)
    }
  }

  let mostCommonEventType = '—'
  let maxCount = 0
  for (const [type, count] of Object.entries(byType)) {
    if (count > maxCount) {
      maxCount = count
      mostCommonEventType = type
    }
  }

  const eventsPerHourToday = Array.from({ length: 24 }, (_, hour) => ({
    label: `${String(hour).padStart(2, '0')}:00`,
    count: eventsPerHourTodayMap.get(hour) ?? 0,
  }))

  const timeSeries24h = Array.from({ length: 24 }, (_, index) => {
    const bucket = Math.floor((now - (23 - index) * 60 * 60 * 1000) / (60 * 60 * 1000))
    const labelDate = new Date(bucket * 60 * 60 * 1000)
    return {
      label: labelDate.toLocaleTimeString('en-LK', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      count: timeSeries24hMap.get(bucket) ?? 0,
    }
  })

  const recentEvents = [...events]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 10)

  return {
    totalEvents: events.length,
    byType,
    recentEvents,
    eventsPerHourToday,
    mostCommonEventType,
    uniqueUserCount: userIds.size,
    timeSeries24h,
    allEvents: events,
  }
}

/** Checks whether the current user is authenticated and has admin access. */
export async function checkAdminAccess(): Promise<AdminAccessResult> {
  const client = getClient()
  if (!client) {
    return {
      authenticated: false,
      isAdmin: false,
      error: 'Analytics is not configured',
    }
  }

  try {
    const {
      data: { session },
      error,
    } = await client.auth.getSession()

    if (error) {
      return { authenticated: false, isAdmin: false, error: error.message }
    }

    if (!session?.user) {
      return { authenticated: false, isAdmin: false }
    }

    const isAdmin = await isAuthenticatedAdmin(client)
    return { authenticated: true, isAdmin }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to verify admin access'
    return { authenticated: false, isAdmin: false, error: message }
  }
}

/**
 * Loads analytics data for the admin dashboard.
 * Requires an authenticated admin session.
 */
export async function fetchAdminAnalytics(): Promise<FetchAdminAnalyticsResult> {
  const client = getClient()
  if (!client) {
    return { success: false, error: 'Analytics is not configured' }
  }

  const isAdmin = await isAuthenticatedAdmin(client)
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: admin access required' }
  }

  try {
    const { data, error } = await client
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logAnalyticsError('fetchAdminAnalytics failed', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: computeAdminAnalytics(data ?? []),
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown analytics error'
    logAnalyticsError('fetchAdminAnalytics network failure', error)
    return { success: false, error: message }
  }
}

/**
 * Deletes analytics events older than the given number of days.
 * Requires an authenticated admin session.
 */
export async function clearAnalyticsOlderThan(
  olderThanDays: number,
): Promise<ClearOldEventsResult> {
  const client = getClient()
  if (!client) {
    return { success: false, error: 'Analytics is not configured' }
  }

  const isAdmin = await isAuthenticatedAdmin(client)
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: admin access required' }
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - olderThanDays)
  const cutoffIso = cutoff.toISOString()

  try {
    const { data, error } = await client
      .from('events')
      .delete()
      .lt('created_at', cutoffIso)
      .select('id')

    if (error) {
      logAnalyticsError('clearAnalyticsOlderThan failed', error)
      return { success: false, error: error.message }
    }

    return { success: true, deletedCount: data?.length ?? 0 }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown analytics error'
    logAnalyticsError('clearAnalyticsOlderThan network failure', error)
    return { success: false, error: message }
  }
}
