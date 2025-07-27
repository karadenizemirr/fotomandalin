// Cloudflare API helper functions
export class CloudflareAPI {
  private zoneId: string
  private apiToken: string
  private baseUrl = 'https://api.cloudflare.com/client/v4'

  constructor(zoneId: string, apiToken: string) {
    this.zoneId = zoneId
    this.apiToken = apiToken
  }

  private async makeRequest(endpoint: string, method = 'GET', data?: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      ...(data && { body: JSON.stringify(data) }),
    })

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Cache Purge Functions
  async purgeCache(files?: string[]) {
    const endpoint = `/zones/${this.zoneId}/purge_cache`
    const data = files ? { files } : { purge_everything: true }
    
    return this.makeRequest(endpoint, 'POST', data)
  }

  async purgeByTags(tags: string[]) {
    const endpoint = `/zones/${this.zoneId}/purge_cache`
    return this.makeRequest(endpoint, 'POST', { tags })
  }

  async purgeByHosts(hosts: string[]) {
    const endpoint = `/zones/${this.zoneId}/purge_cache`
    return this.makeRequest(endpoint, 'POST', { hosts })
  }

  // Analytics Functions
  async getAnalytics(since: string, until: string) {
    const endpoint = `/zones/${this.zoneId}/analytics/dashboard`
    const params = new URLSearchParams({ since, until })
    
    return this.makeRequest(`${endpoint}?${params}`)
  }

  async getBandwidthStats(since: string, until: string) {
    const endpoint = `/zones/${this.zoneId}/analytics/dashboard`
    const params = new URLSearchParams({ 
      since, 
      until,
      continuous: 'true'
    })
    
    return this.makeRequest(`${endpoint}?${params}`)
  }

  // DNS Functions
  async listDNSRecords() {
    const endpoint = `/zones/${this.zoneId}/dns_records`
    return this.makeRequest(endpoint)
  }

  async createDNSRecord(record: {
    type: string
    name: string
    content: string
    ttl?: number
    priority?: number
  }) {
    const endpoint = `/zones/${this.zoneId}/dns_records`
    return this.makeRequest(endpoint, 'POST', record)
  }

  async updateDNSRecord(recordId: string, record: any) {
    const endpoint = `/zones/${this.zoneId}/dns_records/${recordId}`
    return this.makeRequest(endpoint, 'PUT', record)
  }

  async deleteDNSRecord(recordId: string) {
    const endpoint = `/zones/${this.zoneId}/dns_records/${recordId}`
    return this.makeRequest(endpoint, 'DELETE')
  }

  // Page Rules Functions
  async listPageRules() {
    const endpoint = `/zones/${this.zoneId}/pagerules`
    return this.makeRequest(endpoint)
  }

  async createPageRule(rule: {
    targets: Array<{ target: string; constraint: { operator: string; value: string } }>
    actions: Array<{ id: string; value?: any }>
    priority?: number
    status: 'active' | 'disabled'
  }) {
    const endpoint = `/zones/${this.zoneId}/pagerules`
    return this.makeRequest(endpoint, 'POST', rule)
  }

  // Security Functions
  async getSecurityLevel() {
    const endpoint = `/zones/${this.zoneId}/settings/security_level`
    return this.makeRequest(endpoint)
  }

  async setSecurityLevel(level: 'off' | 'essentially_off' | 'low' | 'medium' | 'high' | 'under_attack') {
    const endpoint = `/zones/${this.zoneId}/settings/security_level`
    return this.makeRequest(endpoint, 'PATCH', { value: level })
  }

  async getSSLSetting() {
    const endpoint = `/zones/${this.zoneId}/settings/ssl`
    return this.makeRequest(endpoint)
  }

  async setSSLSetting(value: 'off' | 'flexible' | 'full' | 'strict') {
    const endpoint = `/zones/${this.zoneId}/settings/ssl`
    return this.makeRequest(endpoint, 'PATCH', { value })
  }

  // Performance Functions
  async getMinifySettings() {
    const endpoint = `/zones/${this.zoneId}/settings/minify`
    return this.makeRequest(endpoint)
  }

  async setMinifySettings(settings: {
    css: 'on' | 'off'
    html: 'on' | 'off' 
    js: 'on' | 'off'
  }) {
    const endpoint = `/zones/${this.zoneId}/settings/minify`
    return this.makeRequest(endpoint, 'PATCH', { value: settings })
  }

  async getBrotliSetting() {
    const endpoint = `/zones/${this.zoneId}/settings/brotli`
    return this.makeRequest(endpoint)
  }

  async setBrotliSetting(enabled: boolean) {
    const endpoint = `/zones/${this.zoneId}/settings/brotli`
    return this.makeRequest(endpoint, 'PATCH', { value: enabled ? 'on' : 'off' })
  }

  // Zone Functions
  async getZoneInfo() {
    const endpoint = `/zones/${this.zoneId}`
    return this.makeRequest(endpoint)
  }

  async getZoneSettings() {
    const endpoint = `/zones/${this.zoneId}/settings`
    return this.makeRequest(endpoint)
  }
}

// Helper function to initialize Cloudflare API
export function initCloudflareAPI() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN

  if (!zoneId || !apiToken) {
    throw new Error('Cloudflare credentials not found in environment variables')
  }

  return new CloudflareAPI(zoneId, apiToken)
}

// Cache management utilities
export const cacheUtils = {
  // Generate cache tags for different content types
  generateTags: {
    page: (slug: string) => [`page-${slug}`],
    package: (id: string) => [`package-${id}`, 'packages'],
    gallery: (id: string) => [`gallery-${id}`, 'gallery'],
    user: (id: string) => [`user-${id}`, 'users'],
    booking: (id: string) => [`booking-${id}`, 'bookings'],
    static: ['static-assets'],
    api: (endpoint: string) => [`api-${endpoint.replace('/', '-')}`]
  },

  // Purge specific content types
  purgeContent: async (cf: CloudflareAPI, type: string, id?: string) => {
    const tagMap: Record<string, string[]> = {
      'all': [],
      'packages': ['packages'],
      'gallery': ['gallery'], 
      'users': ['users'],
      'bookings': ['bookings'],
      'static': ['static-assets']
    }

    if (id && type !== 'all') {
      tagMap[type] = [`${type}-${id}`, type]
    }

    const tags = tagMap[type] || []
    
    if (tags.length > 0) {
      return cf.purgeByTags(tags)
    } else {
      return cf.purgeCache()
    }
  }
}

export default CloudflareAPI
