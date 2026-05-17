import { loadAnalyticsEvents, saveAnalyticsEvents } from './storage'

export interface AnalyticsEvent {
  type: string
  data: Record<string, unknown>
  timestamp: number
  userId?: string
}

export class AnalyticsTracker {
  private events: AnalyticsEvent[] = []
  private userId: string | undefined

  constructor(userId?: string) {
    this.userId = userId
    this.events = loadAnalyticsEvents(userId).map((event) => ({
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
      userId: event.userId,
    }))
  }

  setUserId(userId: string | undefined): void {
    if (this.userId === userId) return
    this.userId = userId
    this.events = loadAnalyticsEvents(userId).map((event) => ({
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
      userId: event.userId,
    }))
  }

  /** Re-read events from localStorage (e.g. after another tab or tracker write). */
  refreshFromStorage(): void {
    this.events = loadAnalyticsEvents(this.userId).map((event) => ({
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
      userId: event.userId,
    }))
  }

  trackEvent(type: string, data: object, userId?: string): void {
    const event: AnalyticsEvent = {
      type,
      data: data as Record<string, unknown>,
      timestamp: Date.now(),
      userId: userId ?? this.userId,
    }
    this.events = [...this.events, event].slice(-100)
    saveAnalyticsEvents(this.events, event.userId)
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  getEventsByType(type: string): AnalyticsEvent[] {
    return this.events.filter((event) => event.type === type)
  }

  getEventsInLastHours(hours: number): AnalyticsEvent[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000
    return this.events.filter((event) => event.timestamp >= cutoff)
  }

  getStats(): {
    totalEvents: number
    byType: Record<string, number>
    recentEvents: AnalyticsEvent[]
    eventsPerHour: number
  } {
    const byType: Record<string, number> = {}
    for (const event of this.events) {
      byType[event.type] = (byType[event.type] ?? 0) + 1
    }

    const lastHour = this.getEventsInLastHours(1)
    const recentEvents = [...this.events]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)

    return {
      totalEvents: this.events.length,
      byType,
      recentEvents,
      eventsPerHour: lastHour.length,
    }
  }

  clearEvents(): void {
    this.events = []
    saveAnalyticsEvents([], this.userId)
  }
}

export const tracker = new AnalyticsTracker()
