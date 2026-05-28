// multi-prop AE destructure under nested SE. guards two invariants jointly:
//   1. SE prefix side effects evaluate in source order (calls = ['A', 'B'])
//   2. both inner polyfillable props extract (no residual `({Array: {of}} = ...)`
//      from a sibling that the first prop's cascade orphaned)
const calls = [];
function fxA() { calls.push('A'); return 0; }
function fxB() { calls.push('B'); return 0; }
let from, of;
(fxA(), (fxB(), ({ Array: { from, of } } = globalThis)));
[calls, from, of];
