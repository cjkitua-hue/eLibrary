// =========================
// SIMPLE EVENT BUS (CORE)
// =========================
const listeners = new Map();

export const Events = {
    // =========================
    // SUBSCRIBE TO EVENTS
    // =========================
    on(event, callback) {
        if (!listeners.has(event)) {
            listeners.set(event, []);
        }
        listeners.get(event).push(callback);
    },
    // =========================
    // UNSUBSCRIBE
    // =========================
    off(event, callback) {
        if (!listeners.has(event)) return;

        const updated = listeners.get(event).filter(cb => cb !== callback);
        listeners.set(event, updated);
    },
    // =========================
    // EMIT EVENT
    // =========================
    emit(event, payload) {
        if (!listeners.has(event)) return;

        for (const callback of listeners.get(event)) {
            try {
                callback(payload);
            } catch (err) {
                console.error(`Event error in "${event}":`, err);
            }
        }
    },
    // =========================
    // CLEAR ALL LISTENERS (useful for resets/tests)
    // =========================
    clear() {
        listeners.clear();
    }
};
