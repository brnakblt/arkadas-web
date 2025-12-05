"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';

export default function DeepLinkHandler() {
    const router = useRouter();

    useEffect(() => {
        // Check if running in Tauri environment
        if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) {
            return;
        }

        let unlisten: (() => void) | undefined;

        const initDeepLink = async () => {
            try {
                unlisten = await onOpenUrl((urls) => {
                    console.log('Deep link received:', urls);
                    for (const url of urls) {
                        try {
                            const urlObj = new URL(url);
                            if (urlObj.hostname === 'auth' && urlObj.pathname === '/callback') {
                                const jwt = urlObj.searchParams.get('jwt');
                                const id = urlObj.searchParams.get('id');
                                const username = urlObj.searchParams.get('username');
                                const email = urlObj.searchParams.get('email');

                                if (jwt) {
                                    localStorage.setItem('jwt', jwt);
                                    localStorage.setItem('user', JSON.stringify({ id, username, email }));
                                    router.push('/dashboard');
                                    // Force reload to update context if needed, or router.push is enough
                                    window.location.href = '/dashboard';
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing deep link URL:', e);
                        }
                    }
                });
            } catch (e) {
                console.error('Failed to initialize deep link listener:', e);
            }
        };

        initDeepLink();

        return () => {
            if (unlisten) unlisten();
        };
    }, [router]);

    return null;
}
