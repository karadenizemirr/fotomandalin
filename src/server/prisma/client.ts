import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'], // Sadece gerekli logları tut
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        // Connection pool optimizasyonu
        omit: {
            // Gereksiz alanları hariç tut (performans için)
        },
        // Runtime optimizasyonu
        errorFormat: 'minimal',
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Connection pool health check
export async function checkDatabaseConnection() {
    try {
        await prisma.$connect()
        console.log('✅ Database connected successfully')
        return true
    } catch (error) {
        console.error('❌ Database connection failed:', error)
        return false
    }
}

// Graceful shutdown with better error handling
const gracefulShutdown = async (signal: string) => {
    console.log(`🔌 Received ${signal}, disconnecting from database...`)
    try {
        await prisma.$disconnect()
        console.log('✅ Database disconnected successfully')
    } catch (error) {
        console.error('❌ Error during database disconnect:', error)
    }
    process.exit(0)
}

process.on('beforeExit', gracefulShutdown.bind(null, 'beforeExit'))
process.on('SIGINT', gracefulShutdown.bind(null, 'SIGINT'))
process.on('SIGTERM', gracefulShutdown.bind(null, 'SIGTERM'))
process.on('SIGUSR1', gracefulShutdown.bind(null, 'SIGUSR1'))
process.on('SIGUSR2', gracefulShutdown.bind(null, 'SIGUSR2'))
