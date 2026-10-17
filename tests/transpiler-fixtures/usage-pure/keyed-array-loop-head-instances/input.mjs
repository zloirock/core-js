// Both declaration and assignment loop heads serve instance leaves below an array.
// The extracted assignment bindings remain available after the loop exits.
for (const { w: [{ at, flat }] } of [{ w: [[1, [2]]] }]) use(at, flat);
let includes, startsWith;
for ({ w: [{ includes, startsWith }] } of [{ w: ['abc'] }]) break;
use(includes, startsWith);
