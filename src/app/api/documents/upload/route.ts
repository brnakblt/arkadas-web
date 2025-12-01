import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Forward to Strapi
    const strapiFormData = new FormData();
    strapiFormData.append('files', file);

    // If we want to link it to a specific collection (e.g. 'document'), we can add 'ref', 'refId', 'field'
    // For now, just upload to Media Library.

    const strapiRes = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      // headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }, // If needed
      body: strapiFormData,
    });

    if (!strapiRes.ok) {
      const errorText = await strapiRes.text();
      console.error("Strapi upload failed:", errorText);
      return NextResponse.json({ error: "Upload to Strapi failed" }, { status: strapiRes.status });
    }

    const data = await strapiRes.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
