import "core-js/modules/es.array.at";
// entry-global runs no usage traversal, so it mounts the instantiation-slot restoration in a pass
// of its own - the shapes below prove that pass covers the whole slot domain, not just the casts.
// dropped, the parens re-associate the call into the arrow body / the ternary alternate / the
// optional chain, or stop parsing; the tail lines are negatives and must stay bare

const f: any = (x: number) => x;
const g: any = (x: number) => x;
const o: any = {
  m: f
};
let q: any;
const viaArrow = (() => f)<string>(1);
const viaConditional = (g ? f : g)<string>(1);
const viaAssign = (q = f)<string>(1);
const viaBinary = (f + g)<string>(1);
const viaLogical = (f || g)<string>(1);
const viaUnary = (void f)<string>(1);
const viaPostfix = (q++)<string>(1);
const viaPrefix = (++q)<string>(1);
const viaOptionalMember = (o?.m)<string>(1);
const viaOptionalCall = (o?.())<string>(1);
const viaCast = (f as any)<string>(1);
const viaBare = f<string>(1);
const viaMember = o.m<string>(1);
const viaNonNull = f!<string>(1);
const viaSequence = (q++, f)<string>(1);
export const r = [viaArrow, viaConditional, viaAssign, viaBinary, viaLogical, viaUnary, viaPostfix, viaPrefix, viaOptionalMember, viaOptionalCall, viaCast, viaBare, viaMember, viaNonNull, viaSequence];