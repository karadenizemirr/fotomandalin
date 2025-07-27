import { NextRequest, NextResponse } from 'next/server'
import { initCloudflareAPI, cacheUtils } from '@/lib/cloudflare'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST /api/admin/cache/purge
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, id, files, tags, hosts } = body

    const cf = initCloudflareAPI()

    let result

    if (files && files.length > 0) {
      // Purge specific files
      result = await cf.purgeCache(files)
    } else if (tags && tags.length > 0) {
      // Purge by tags
      result = await cf.purgeByTags(tags)
    } else if (hosts && hosts.length > 0) {
      // Purge by hosts
      result = await cf.purgeByHosts(hosts)
    } else if (type) {
      // Purge by content type
      result = await cacheUtils.purgeContent(cf, type, id)
    } else {
      // Purge everything
      result = await cf.purgeCache()
    }

    return NextResponse.json({
      success: true,
      message: 'Cache purged successfully',
      result
    })

  } catch (error) {
    console.error('Cache purge error:', error)
    return NextResponse.json(
      { error: 'Failed to purge cache' },
      { status: 500 }
    )
  }
}

// GET /api/admin/cache/status
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cf = initCloudflareAPI()
    
    // Get zone info and settings
    const [zoneInfo, zoneSettings] = await Promise.all([
      cf.getZoneInfo(),
      cf.getZoneSettings()
    ])

    return NextResponse.json({
      success: true,
      data: {
        zone: zoneInfo.result,
        settings: zoneSettings.result
      }
    })

  } catch (error) {
    console.error('Cache status error:', error)
    return NextResponse.json(
      { error: 'Failed to get cache status' },
      { status: 500 }
    )
  }
}
