import _Array$from from "@core-js/pure/actual/array/from";
// a REALM HOP whose key an enum member spells names the hop like every other spelling of that key,
// so the claim above it fires: the run folds away and the static is substituted. named by the
// structural fold alone the hop stayed unknown, the claim was lost, and the run kept a raw read
enum HopName {
  SELF = 'self',
}
// ... and the same hop as a DESTRUCTURE init: the pattern extracts through the resolved receiver
// exactly as the literal spelling does, and the patched twin keeps the raw read
const fromHop = _Array$from;
export const r19 = typeof fromHop;