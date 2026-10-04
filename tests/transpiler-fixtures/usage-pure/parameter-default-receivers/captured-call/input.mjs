// A destructuring assignment in a parameter default evaluates its array-producing call once.
// Reentry from the effectful key retains each invocation's receiver and both method targets.
let calls = 0;
let inner;
let busy = false;
function built() {
  return [++calls, [9]];
}
function reenter() {
  if (!busy) {
    busy = true;
    inner = read();
  }
}
function read(at, flat, value = ({ [(reenter(), 'at')]: at, flat } = built())) {
  return [at.call(value, 0), flat.call(value)[0], value];
}
export const result = [read(), inner, calls];
