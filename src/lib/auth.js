export function getAuthToken() {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
    let token = match ? decodeURIComponent(match[1]) : null;

    if (token && token.startsWith('Bearer ')) {
        token = token.replace('Bearer ', '');
    }

    if (!token || token === 'null' || token === 'undefined' || token === 'session-active') {
        process.env.NODE_ENV === 'development' && console.warn("getAuthToken: No valid auth_token found in cookies.");
        return null;
    }

    return token;
}
