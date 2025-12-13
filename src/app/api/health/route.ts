import { NextResponse } from 'next/server';

export async function GET() {
    // In a real app, you would check database connection, redis, etc.
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: 'connected', // Mock
            cache: 'connected',    // Mock
            mebbis: 'reachable',   // Mock
        },
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV,
    };

    return NextResponse.json(healthStatus, { status: 200 });
}
