import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a write the parked body itself owns is not a write its caller can make: nothing of anyone else's
// runs between the guard above the `await` and the read below it, so the read keeps its narrow.
// the same binding lifted OUT of that body sits where the caller reaches it while the body is
// parked, and both families inject
export async function bodyLocalWrite(v, extra) {
  let x = v;
  let out = null;
  if (typeof x === 'string') {
    await 0;
    out = _includesMaybeString(x).call(x, 'a');
  }
  x = extra;
  return out;
}
export function callerReachableWrite(v, extra) {
  let y = v;
  let out = null;
  async function read() {
    if (typeof y === 'string') {
      await 0;
      out = _at(y).call(y, 0);
    }
  }
  const done = read();
  y = extra;
  return done.then(() => out);
}