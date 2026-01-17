interface TechnicalMetadata {
    browser: {
        name: string;
        version: string;
        userAgent: string;
    };
    device: {
        type: 'desktop' | 'mobile' | 'tablet';
        os: string;
        screenResolution: string;
        viewportSize: string;
    };
    location: {
        country?: string;
        city?: string;
        timezone: string;
        language: string;
    };
    session: {
        referrer: string;
        landingPage: string;
        timestamp: string;
        dayOfWeek: string;
        timeOfDay: string;
    };
    technical: {
        jsEnabled: boolean;
        cookiesEnabled: boolean;
        doNotTrack: boolean;
        connectionType?: string;
    };
}

export function collectTechnicalMetadata(): TechnicalMetadata {
    const ua = navigator.userAgent;

    // Detect browser
    const getBrowser = () => {
        if (ua.includes('Firefox')) return { name: 'Firefox', version: ua.match(/Firefox\/(\d+)/)?.[1] || 'unknown' };
        if (ua.includes('Edg')) return { name: 'Edge', version: ua.match(/Edg\/(\d+)/)?.[1] || 'unknown' };
        if (ua.includes('Chrome')) return { name: 'Chrome', version: ua.match(/Chrome\/(\d+)/)?.[1] || 'unknown' };
        if (ua.includes('Safari')) return { name: 'Safari', version: ua.match(/Version\/(\d+)/)?.[1] || 'unknown' };
        return { name: 'Unknown', version: 'unknown' };
    };

    // Detect OS
    const getOS = () => {
        if (ua.includes('Windows NT 10')) return 'Windows 10/11';
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac OS X')) return 'macOS ' + (ua.match(/Mac OS X (\d+[._]\d+)/)?.[1].replace('_', '.') || '');
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Unknown';
    };

    // Detect device type
    const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
        return 'desktop';
    };

    // Get current time info
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hour = now.getHours();
    const getTimeOfDay = () => {
        if (hour >= 5 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 17) return 'Afternoon';
        if (hour >= 17 && hour < 21) return 'Evening';
        return 'Night';
    };

    // Get connection type if available
    const getConnectionType = () => {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        return connection?.effectiveType || connection?.type || undefined;
    };

    return {
        browser: {
            name: getBrowser().name,
            version: getBrowser().version,
            userAgent: ua,
        },
        device: {
            type: getDeviceType(),
            os: getOS(),
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        },
        location: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
        },
        session: {
            referrer: document.referrer || 'Direct',
            landingPage: window.location.href,
            timestamp: now.toISOString(),
            dayOfWeek: days[now.getDay()],
            timeOfDay: getTimeOfDay(),
        },
        technical: {
            jsEnabled: true, // Obviously true if this code runs
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack === '1',
            connectionType: getConnectionType(),
        },
    };
}

// Get geolocation data from IP (using a free API)
export async function getGeolocation(): Promise<{ country?: string; city?: string; countryCode?: string }> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            country: data.country_name,
            city: data.city,
            countryCode: data.country_code,
        };
    } catch (error) {
        console.error('Failed to get geolocation:', error);
        return {};
    }
}
