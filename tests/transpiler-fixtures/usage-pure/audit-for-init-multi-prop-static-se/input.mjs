// for-loop init destructuring multiple static properties from a side-effecting
// receiver: the receiver must be evaluated once and shared.
let sideFx = () => 0;
for (const { from, of } = (sideFx(), Array); sideFx() < 1;) { from([of(0)]); break; }
