// a REALM HOP whose key an enum member spells names the hop like every other spelling of that key,
// so the claim above it fires: the run folds away and the static is substituted. named by the
// structural fold alone the hop stayed unknown, the claim was lost, and the run kept a raw read
enum HopName { SELF = 'self' }
// a `delete` over the same enum-spelled hop lands the operator's ROOT binding, as it does for every
// other spelling of that key - the fold's own rule, not the run's landing
export const r18 = delete globalThis[HopName.SELF].customQ;
