// the claim may stand a dotted PLAIN run above a probe-holding alias: the whole run is the
// erased read (its first link dereferences the held value and throws exactly where native
// does), so the probe respells it verbatim. an SE computed key in the run has no probe
// spelling - respelling would double its effect - and the swap stands down whole instead
const heldProbe = globalThis.window;
export const chainRunReadCall = heldProbe.Array.of(11);
export const chainRunDeep = heldProbe.Array.of(12).at(0);
let seKey = 0;
export const chainSeKeyDeclined = (heldProbe)[(seKey++, 'Array')].of(13);
export { seKey };
const heldGuardable = globalThis.window?.self;
let seKey2 = 0;
export const chainSeKeyDeclinedGuarded = heldGuardable[(seKey2++, 'Object')].freeze({ marker: 14 });
export { seKey2 };
