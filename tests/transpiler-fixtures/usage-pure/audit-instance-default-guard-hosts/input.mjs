// HOST axis of the instance-default guard: every binding host preserves the user default
// behind the `=== void 0` guard, and a split host keeps the native per-prop order

// plain block declaration, unknown receiver - the per-prop channel's guard
const { at: a = dfltA() } = recvA;

// plain assignment cascade
let fl;
({ flat: fl = dfltB() } = recvB);

// typed receiver: the type-specific dispatcher is still guarded (uniform shape); the
// default is dead at runtime post-polyfill
const { includes: inc = dfltC() } = [1, 2];

// parameter default: the synth literal carries the dispatcher, the pattern keeps the
// user default (fires when the dispatcher read is undefined)
function fnG({ findLast: fnl = dfltD() } = recvD) { return fnl; }
export const g = fnG();

// for-init host: the guarded extraction and the split segment join the loop header
let out1;
for (const { [(e1(), 'findLastIndex')]: fli = dfltE(), [(e2(), 'toSorted')]: tso } = recvE; !out1;) out1 = [fli, tso];

// export host: the split keeps every binding exported
export const { [(e3(), 'toReversed')]: trv = dfltF(), [(e4(), 'flatMap')]: fm } = recvF;

// bodyless control-slot host: the block-wrap and the split compose
if (cnd) var { [(e5(), 'with')]: w5 = dfltG(), [(e6(), 'toSpliced')]: tsp } = recvG;

export { a, fl, inc, out1, w5, tsp };
