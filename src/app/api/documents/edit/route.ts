import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { MicrosoftGraphService } from '@/lib/microsoftGraph';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized or missing Microsoft Token" }, { status: 401 });
    }

    const { fileUrl, fileName } = await request.json();

    if (!fileUrl || !fileName) {
      return NextResponse.json({ error: "Missing fileUrl or fileName" }, { status: 400 });
    }

    // 1. Fetch file from Strapi
    // Ensure URL is absolute
    const absoluteUrl = fileUrl.startsWith('http') ? fileUrl : `${STRAPI_URL}${fileUrl}`;
    const fileRes = await fetch(absoluteUrl);
    
    if (!fileRes.ok) {
        return NextResponse.json({ error: "Failed to fetch file from Strapi" }, { status: 404 });
    }
    
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload to OneDrive
    const graphService = new MicrosoftGraphService(session.accessToken);
    const uploadRes = await graphService.uploadFile(fileName, buffer);
    
    // 3. Get Edit Link
    // The upload response usually contains the item ID and webUrl
    // uploadRes.id, uploadRes.webUrl
    
    // If we want a specific "edit" link that might be different from the default webUrl:
    // const editLink = await graphService.createEditLink(uploadRes.id);
    
    // For personal OneDrive, webUrl is usually the view/edit link.
    const webUrl = uploadRes.webUrl;

    return NextResponse.json({ editUrl: webUrl });

  } catch (error) {
    console.error("Edit flow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
