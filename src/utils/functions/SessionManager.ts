const SESSION_KEY = "hotel_search_session_start";
const SESSION_DURATION_MINUTES = 40;

export const SessionManager = {
    startSession: () => {
        const now = Date.now();
        localStorage.setItem(SESSION_KEY, now.toString());
    },

    isSessionValid: (): boolean => {
        const stored = localStorage.getItem(SESSION_KEY);
        if (!stored) return false;

        const sessionStart = parseInt(stored, 10);
        const now = Date.now();
        const diffMinutes = (now - sessionStart) / (1000 * 60);

        return diffMinutes < SESSION_DURATION_MINUTES;
    },

    getRemainingTime: () => {
        const stored = localStorage.getItem(SESSION_KEY);
        if (!stored) return 0;

        const sessionStart = parseInt(stored, 10);
        const now = Date.now();
        const elapsed = (now - sessionStart) / (1000 * 60);
        return Math.max(0, SESSION_DURATION_MINUTES - elapsed);
    },

    clearSession: () => {
        localStorage.removeItem(SESSION_KEY);
    },
};