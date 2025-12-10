
import { NextResponse } from 'next/server';
import { NextcloudService } from '@/services/nextcloudService';

export async function GET() {
    const nextcloudUrl = process.env.NEXT_PUBLIC_NEXTCLOUD_URL || "http://localhost:8080";
    const username = process.env.NEXTCLOUD_USER || "admin";
    const password = process.env.NEXTCLOUD_PASSWORD || "admin";

    const service = new NextcloudService(nextcloudUrl, username, password);

    try {
        const capabilities = await service.getCapabilities();
        // List root files
        // The listFiles returns a raw XML string currently, so we just return it as text for now or try to parse if we had a parser
        const filesXml = await service.listFiles('/');

        return NextResponse.json({
            success: true,
            config: {
                url: nextcloudUrl,
                user: username,
            },
            capabilities,
            filesXmlSample: filesXml.substring(0, 200) + "..." // Truncate for readability
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
