// A sequence prefix keeps the stored probe and the plain read above it.
// That read must throw before the outer computed key when the probe is absent.
let held;
const value = (before(), held = globalThis.window).window[(key(), 'keptProbeSlot')];
export { held, value };
