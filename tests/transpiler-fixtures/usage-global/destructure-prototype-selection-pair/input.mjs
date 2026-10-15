// A decided realm selection evaluates its prefix once before both instance reads.
const events = [];
class Source { static get effect() { events.push('effect'); return 0; } }
const { Array: { prototype: { at, flat } } } = (Source.effect, globalThis) ?? {};
