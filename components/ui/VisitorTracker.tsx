'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase-analytics'
import { getBrowser, getOS, getDeviceType, isMobileDevice } from '@/lib/visitorData'

export default function VisitorTracker() {
  useEffect(() => {
    const startTime = Date.now()

    async function track() {
      try {
        const { count } = await supabase
          .from('visitor_analytics')
          .select('*', { count: 'exact', head: true })

        if ((count ?? 0) >= 10) return

        const ua = navigator.userAgent
        const width = window.innerWidth
        const { name: browser, version: browser_version } = getBrowser(ua)
        const os = getOS(ua)
        const device_type = getDeviceType(ua, width)
        const mobile = isMobileDevice(ua, width)
        const screen_size = `${screen.width}x${screen.height}`

        let city = 'Unknown'
        let country = 'Unknown'
        let ip_address = 'Unknown'
        let location = 'Unknown'

        try {
          const geo = await fetch('https://ipapi.co/json/')
          if (geo.ok) {
            const data = await geo.json()
            city       = data.city         ?? 'Unknown'
            country    = data.country_name  ?? 'Unknown'
            ip_address = data.ip            ?? 'Unknown'
            location   = `${city}, ${country}`
          }
        } catch {
          location = 'Location unavailable'
        }

        const { data: inserted } = await supabase
          .from('visitor_analytics')
          .insert({
            mobile,
            location,
            city,
            country,
            browser,
            browser_version,
            session_time: 0,
            screen_size,
            os,
            device_type,
            ip_address,
          })
          .select('id')
          .single()

        if (!inserted) return

        const recordId = inserted.id

        const updateSession = async () => {
          const seconds = Math.floor((Date.now() - startTime) / 1000)
          await supabase
            .from('visitor_analytics')
            .update({ session_time: seconds })
            .eq('id', recordId)
        }

        window.addEventListener('beforeunload', updateSession)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') updateSession()
        })
      } catch (err) {
        console.warn('Visitor tracking failed:', err)
      }
    }

    track()
  }, [])

  return null
}
