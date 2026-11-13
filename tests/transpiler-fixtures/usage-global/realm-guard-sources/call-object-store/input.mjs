// Keep the source guard and distinguish realm values from user properties.
function h() { return globalThis.window; } let w; export const r = (w = h())?.Object?.hasOwn({ x: 1 }, 'x');
