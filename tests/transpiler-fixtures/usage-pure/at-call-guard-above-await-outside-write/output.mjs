import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// an async body resumes only when its caller lets it, so a write the caller makes while it is parked
// lands between a guard standing above the `await` and the read below it: that guard proves nothing
// and both families inject. a guard the body reaches BELOW the same parking point re-narrows after
// the caller has had its turn and keeps its own family
export function guardAboveAwait(v, extra) {
  let x = v;
  async function read() {
    if (typeof x === 'string') {
      await 0;
      return _at(x).call(x, 0);
    }
    return null;
  }
  const done = read();
  x = extra;
  return done;
}
export function guardBelowAwait(v, extra) {
  let y = v;
  async function read() {
    await 0;
    if (typeof y === 'string') return _includesMaybeString(y).call(y, 'a');
    return null;
  }
  const done = read();
  y = extra;
  return done;
}