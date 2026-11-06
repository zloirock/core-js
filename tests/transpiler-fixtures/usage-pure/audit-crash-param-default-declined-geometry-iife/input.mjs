// IIFE twin of the declined-geometry shapes: an immediately invoked function has every call site
// visible, so the same per-prop removal ranges run on a different host node. the DYNAMIC computed key
// is what keeps these off the synth path - replaying it would re-evaluate the key expression
// a leading RUN of two removed props shares a comma between them
const leadingRun = (function ({ from, of, [globalThis.pick]: z } = Array) { return [from, of, z]; })();
// the retained prop separates the removed ones, so the two ranges stay disjoint
const noncontiguous = (function ({ entries, [globalThis.pick]: z, keys } = Object) { return [entries, keys, z]; })();
// a trailing RUN whose higher-indexed prop is LAST
const consecutiveTail = (function ({ [globalThis.pick]: z, values, fromEntries } = Object) { return [values, fromEntries, z]; })();
export { leadingRun, noncontiguous, consecutiveTail };
