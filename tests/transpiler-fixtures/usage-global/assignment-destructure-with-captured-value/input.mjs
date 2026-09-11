// a destructuring assignment whose value is captured: the receiver stays the source expression on
// every emitter, and each consuming position keeps its own module - one method per position so a
// dropped one is visible in the import set
let a1, a2, a3, a4;
const shim = null;
const host1 = ({ assign: a1 } = shim || Object);
let host2;
host2 = ({ entries: a2 } = shim ? shim : Object);
export function reader() {
  return ({ fromEntries: a3 } = shim || Object);
}
({ getOwnPropertyDescriptors: a4 } = shim || Object);
console.log(host1, host2, a1, a2, a3, a4);
