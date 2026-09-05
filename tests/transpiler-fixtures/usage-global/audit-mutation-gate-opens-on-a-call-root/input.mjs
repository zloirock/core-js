// a write ROOTED AT A CALL: the cheap walk decides whether a callee can be followed, but it never
// inlines what the call returns, so it can rule nothing out - the gate OPENS and every name in the
// file is treated as written. the two reads below carry no write of their own and are deopted all
// the same, which is what an open gate means and why a file that has one cannot host a row about
// which root the walk followed
const xs = [];
function realm() {
  return globalThis;
}
realm().Map.groupBy = patch;
Array.from(xs).at(0);
Map.groupBy(xs, it => it);
