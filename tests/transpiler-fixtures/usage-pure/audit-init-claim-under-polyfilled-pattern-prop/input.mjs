// a destructure prop that is itself polyfilled owns the PATTERN, not the whole init: the extraction
// re-emits that init, so the claims inside it keep their own rewrites. claiming the entire proxy-rooted
// chain reached every member however far above the navigation, and the inner claim shipped as a native
// read - the instance method left unpolyfilled, the collapsing constructor left as a hop off the global.
export const { name } = self.Array.prototype.at;
export const { name: navName } = globalThis.window.Array.prototype.at;
export const { name: ctorName } = self.Map.prototype.has;
let assigned;
({ name: assigned } = self.Array.prototype.at);
export { assigned };

// a PROBED nav keeps its short-circuit: the init channels decline it on purpose (an always-defined
// ponyfill would erase the source read) and defer to the claim channel's guard render. the deferral
// was to NOBODY while the ownership bound also claimed the member over such a nav - the same mark
// suppressed the very visitor it counted on
export const { name: probed } = globalThis.window?.self.Map;
export const { name: probedStatic } = globalThis.window?.self.Array.of;
// the claim's SE regions are read through `loc` as well as the numeric span - an extraction hands
// this resolver a CLONE, which keeps only the former, and a position-less claim used to stand down
let seq = 0;
export const { name: leadingEffect } = (seq++, (seq++, globalThis.window?.self))?.Array.of;

// NEGATIVE: a pattern prop with no polyfill of its own leaves the init to the natural rewrite
export const { length } = self.Array.prototype.at;
// NEGATIVE: the navigation itself is still owned by the destructure - no double rewrite of the hops
export const { of } = self.window.Array;
