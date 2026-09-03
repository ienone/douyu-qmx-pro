export const extractDouyuCsrfConfig = (source) => {
    const text = String(source || '')
        .replaceAll('\\"', '"')
        .replaceAll("\\'", "'");
    const cookieKey = text.match(/(?:["']?tvk["']?)\s*:\s*["']([^"']+)["']/)?.[1] || '';
    const cookiePrefix = text.match(/(?:["']?cookie_pre["']?)\s*:\s*["']([^"']*)["']/)?.[1] || '';
    return {
        fieldName: text.match(/(?:["']?tn["']?)\s*:\s*["']([^"']+)["']/)?.[1] || '',
        cookieName: cookieKey && cookiePrefix && !cookieKey.startsWith(cookiePrefix)
            ? `${cookiePrefix}${cookieKey}`
            : cookieKey,
    };
};
