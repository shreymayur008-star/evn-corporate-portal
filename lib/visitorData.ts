export interface VisitorData {
  mobile:          boolean
  location:        string
  city:            string
  country:         string
  browser:         string
  browser_version: string
  session_time:    number
  screen_size:     string
  os:              string
  device_type:     string
  ip_address:      string
}

export function getBrowser(ua: string): { name: string; version: string } {
  if (ua.includes('Edg/')) {
    const v = ua.match(/Edg\/([\d.]+)/)?.[1] ?? ''
    return { name: 'Edge', version: v }
  }
  if (ua.includes('OPR/') || ua.includes('Opera')) {
    const v = ua.match(/OPR\/([\d.]+)/)?.[1] ?? ''
    return { name: 'Opera', version: v }
  }
  if (ua.includes('Chrome/')) {
    const v = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? ''
    return { name: 'Chrome', version: v }
  }
  if (ua.includes('Firefox/')) {
    const v = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? ''
    return { name: 'Firefox', version: v }
  }
  if (ua.includes('Safari/')) {
    const v = ua.match(/Version\/([\d.]+)/)?.[1] ?? ''
    return { name: 'Safari', version: v }
  }
  return { name: 'Unknown', version: '' }
}

export function getOS(ua: string): string {
  if (ua.includes('Windows NT 10'))  return 'Windows 10/11'
  if (ua.includes('Windows'))        return 'Windows'
  if (ua.includes('Mac OS X'))       return 'macOS'
  if (ua.includes('Android'))        return 'Android'
  if (ua.includes('iPhone'))         return 'iOS (iPhone)'
  if (ua.includes('iPad'))           return 'iOS (iPad)'
  if (ua.includes('Linux'))          return 'Linux'
  return 'Unknown'
}

export function getDeviceType(ua: string, width: number): string {
  if (/iPad|Android(?!.*Mobile)/i.test(ua)) return 'Tablet'
  if (/Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'Mobile'
  if (width < 768) return 'Mobile'
  if (width < 1024) return 'Tablet'
  return 'Desktop'
}

export function isMobileDevice(ua: string, width: number): boolean {
  return /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || width < 768
}
