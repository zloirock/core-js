// entry-global runs no usage traversal, so it mounts the instantiation-slot restoration in a pass
// of its own - the operator inners below prove that pass covers the slot domain, not just the casts:
// dropped, the parens re-associate the call into the arrow body, the ternary alternate or an operand,
// or stop parsing
import "core-js/es/array/at";
const f: any = (x: number) => x;
const g: any = (x: number) => x;
let q: any;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaArrow = ((() => f)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaConditional = ((g ? f : g)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaAssign = ((q = f)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaBinary = ((f + g)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaLogical = ((f || g)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaUnary = ((void f)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaPostfix = ((q++)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaPrefix = ((++q)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaSequence = ((q++, f)<string>)(1);
export const r = [viaArrow, viaConditional, viaAssign, viaBinary, viaLogical, viaUnary, viaPostfix, viaPrefix, viaSequence];
