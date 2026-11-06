// for-loop init destructuring multiple instance-method properties from a side-effecting
// receiver: the receiver must be evaluated once and shared.
let sideFx = () => 0;
for (const { at, flat } = (sideFx(), [[1, 2], [3]]); false;) { at(0); flat(); }
