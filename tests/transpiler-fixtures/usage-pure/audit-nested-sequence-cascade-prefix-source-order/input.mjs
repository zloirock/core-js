// Nested assignment sequences keep every prefix in source order.
// Both static bindings receive their polyfills after those prefixes.
const calls = [];
function fxA() { calls.push('A'); return 0; }
function fxB() { calls.push('B'); return 0; }
let from, of;
(fxA(), (fxB(), ({ Array: { from, of } } = globalThis)));
[calls, from, of];
