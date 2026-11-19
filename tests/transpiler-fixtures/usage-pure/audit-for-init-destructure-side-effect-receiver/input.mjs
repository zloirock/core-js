// for-loop init with a destructure whose receiver has side effects: the receiver must
// be evaluated once and shared across destructure rewrites.
let sideFx = () => 0;
for (const { from } = (sideFx(), Array); sideFx() < 1;) { from([0]); break; }
