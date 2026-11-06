// a REALM HOP whose key an enum member spells names the hop like every other spelling of that key,
// so the claim above it fires: the run folds away and the static is substituted. named by the
// structural fold alone the hop stayed unknown, the claim was lost, and the run kept a raw read
enum HopName { SELF = 'self' }
// ... and the INSTANCE split over the same hop: its receiver collapses like the static one, so the
// dispatch reads the ponyfill instead of a realm slot the host may not have
export const r21 = globalThis[HopName.SELF].Array.prototype.at.call([7, 8], -1);
