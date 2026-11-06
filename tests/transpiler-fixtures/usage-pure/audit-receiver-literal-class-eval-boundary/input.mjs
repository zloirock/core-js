// A class-evaluation-time value makes the literal receiver single-read-only. Capture the whole
// object once, select the nested instance method from that capture, then read the outer sibling.
const { y: { at: a }, q } = { y: [class K { static p = holder.p }], q: 1 };
// an INSTANCE field initializer runs per construction (user code constructs whichever copy it
// reads), so the literal stays freely copyable
const { z: { flat: b } } = { z: [class L { p = holder.p }] };
export const r = [a, b, q];
