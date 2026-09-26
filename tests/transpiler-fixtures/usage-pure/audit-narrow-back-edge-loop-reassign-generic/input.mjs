// a string-narrow established before a loop is invalidated by a reassignment on the loop back-edge:
// the receiver may be a number[] on the second iteration, so .at falls to the generic dispatcher
// rather than the string-specific helper
declare function cond(): boolean;
declare function readAny(): any;
function f(x: string | number[]) {
  if (typeof x !== "string") return;
  while (cond()) {
    x.at(0);
    x = readAny();
  }
}
