import { NextRequest, NextResponse } from 'next/server'
import { initCloudflareAPI } from '@/lib/cloudflare'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/analytics/cloudflare
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since') || '-7d' // Last 7 days
    const until = searchParams.get('until') || 'now'

    const cf = initCloudflareAPI()

    // Get analytics data
    const [analytics, bandwidth] = await Promise.all([
      cf.getAnalytics(since, until),
      cf.getBandwidthStats(since, until)
    ])

    return NextResponse.json({
      success: true,
      data: {
        analytics: analytics.result,
        bandwidth: bandwidth.result,
        period: { since, until }
      }
    })

  } catch (error) {
    console.error('Cloudflare analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics data' },
      { status: 500 }
    )
  }
}

// GET /api/admin/analytics/cloudflare/summary
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cf = initCloudflareAPI()

    // Get comprehensive analytics summary
    const [
      analytics,
      zoneInfo,
      securityLevel,
      sslSetting,
      minifySettings,
      brotliSetting
    ] = await Promise.all([
      cf.getAnalytics('-24h', 'now'),
      cf.getZoneInfo(),
      cf.getSecurityLevel(),
      cf.getSSLSetting(),
      cf.getMinifySettings(),
      cf.getBrotliSetting()
    ])

    return NextResponse.json({
      success: true,
      data: {
        analytics: analytics.result,
        zone: {
          name: zoneInfo.result.name,
          status: zoneInfo.result.status,
          plan: zoneInfo.result.plan.name,
          nameServers: zoneInfo.result.name_servers
        },
        security: {
          level: securityLevel.result.value,
          ssl: sslSetting.result.value
        },
        performance: {
          minify: minifySettings.result.value,
          brotli: brotliSetting.result.value
        }
      }
    })

  } catch (error) {
    console.error('Cloudflare summary error:', error)
    return NextResponse.json(
      { error: 'Failed to get summary data' },
      { status: 500 }
    )
  }
}
