// A constructor landing preserves the effect before its optional name read.
// The effect runs once even when the constructor is supplied by a ponyfill.
export const effects = [];
export const r = globalThis?.[(effects.push("key"), "Map")]?.name;
