// hooks/useActivityTracker.ts
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect, useCallback } from 'react'

export const useActivityTracker = () => {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const trackActivity = useCallback(async (action: string, data?: any) => {
    if (status !== 'authenticated' || !session) return

    try {
      await fetch('/api/user-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          data,
          page: pathname,
        }),
      })
    } catch (error) {
      console.error('Failed to track activity:', error)
    }
  }, [session, status, pathname])

  // Track page visits
  useEffect(() => {
    if (status === 'authenticated') {
      trackActivity('page_visit', { 
        path: pathname,
        timestamp: new Date().toISOString()
      })
    }
  }, [pathname, status, trackActivity])

  // Track session start
  useEffect(() => {
    if (status === 'authenticated' && session) {
      trackActivity('session_start', {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }
  }, [status, session, trackActivity])

  return { trackActivity }
}