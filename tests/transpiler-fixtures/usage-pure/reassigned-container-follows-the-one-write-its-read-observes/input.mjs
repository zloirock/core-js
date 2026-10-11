// pure resolves a REASSIGNED container binding on proof: an unconditional write, nothing written after the
// read, is the ONE value the read can observe, so pure follows it - through a pattern, a member read, an
// array wrapper, a class base, a reassigned class, a write behind an effect, a cross-form pattern write or a
// `??=` over a binding still unset - and serves that value's static, never the init's
let rw1 = { k: Object };
rw1 = { k: Map };
const { k: { groupBy: viaDominating } } = rw1;
let rw2 = { s: Object };
rw2 = { s: Array };
export const viaDominatingMember = rw2.s.from([1]);
let rw5 = [{ p: Object }];
rw5 = [{ p: Promise }];
const [{ p: { race: viaWrapper } }] = rw5;
let base6 = Object;
base6 = Array;
class R6 extends base6 {
  static go() { return super.of(1); }
}
export const viaExtends = R6.go();
class R7 { static M = Object; }
R7 = { M: Promise };
const { withResolvers: viaClassReassign } = R7.M;
let effCount = 0;
const eff9 = () => effCount++;
let rw9 = { d: Object };
rw9 = (eff9(), { d: Promise });
const { d: { allSettled: viaSeWrite } } = rw9;
let wPL = { n: Object };
({ 0: wPL } = [{ n: Number }]);
const { n: { isInteger: viaPatternObjLhs } } = wPL;
let wNu;
wNu ??= { u: Object };
const { u: { getOwnPropertyNames: viaNullishBinding } } = wNu;
export { viaDominating, viaWrapper, viaClassReassign, viaSeWrite, viaPatternObjLhs, viaNullishBinding };
