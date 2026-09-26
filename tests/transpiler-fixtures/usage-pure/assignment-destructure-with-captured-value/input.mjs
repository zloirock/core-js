// A consumed assignment yields its selected receiver and dispatches its static by identity.
// The value-discarding statement keeps the branch mirror.
let a1, a2, a3, a4;
const shim = null;
const host1 = ({ assign: a1 } = shim || Object);
let host2;
host2 = ({ assign: a2 } = shim ? shim : Object);
export function reader() {
  return ({ assign: a3 } = shim || Object);
}
({ assign: a4 } = shim || Object);
console.log(host1, host2, a1, a2, a3, a4);
