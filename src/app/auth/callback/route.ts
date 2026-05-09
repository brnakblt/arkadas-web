import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * OIDC Callback Handler
 * Finalizes the SSO handshake and sets the secure session cookie.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const tenantId = searchParams.get('state') || 'public';

    if (!code) {
        return NextResponse.redirect(new URL('/?error=missing_code', request.url));
    }

    try {
        const coreApiUrl = process.env.CORE_API_URL || 'http://core-api:8000';
        
        // 1. Exchange code for token via our Core API Bridge
        const response = await fetch(`${coreApiUrl}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, tenant_id: tenantId }),
        });

        if (!response.ok) {
            console.error('[Auth Callback] Token exchange failed:', await response.text());
            return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
        }

        const { access_token } = await response.json();

        // 2. Set Secure HTTP-Only Cookie
        const cookieStore = await cookies();
        cookieStore.set('arkadas_session', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        // 3. Redirect to Dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));

    } catch (error) {
        console.error('[Auth Callback] Internal Error:', error);
        return NextResponse.redirect(new URL('/?error=server_error', request.url));
    }
}
