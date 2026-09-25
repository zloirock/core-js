// A constructor a READ hands out through a call's result or a selection takes its whole family:
// the read steps through a call to what the callee returns and through each arm a selection may
// yield, at a member read and at every level of a pattern. A parameter-filled slot holds its own
// call's argument, so a constructor another call passes stays home. one constructor per row
const flag = globalThis.flag;
const f = x => ({ a: x, b: 1 });
function twice() { if (flag) return { a: URL }; return { a: null }; }
function pair() { if (flag) return { a: AggregateError }; return { a: null }; }
const selected = flag ? { a: SuppressedError } : { a: null };
export const viaCallSlot = f(Map).a;
export const viaReturns = twice().a;
export const viaSelection = selected.a;
export const { a: viaPattern } = pair();
export const { k: { a: viaNested } } = { k: f(Promise) };
export const { a: viaLogical } = flag || { a: Iterator };
export const viaOtherSlot = f(Symbol).b;
