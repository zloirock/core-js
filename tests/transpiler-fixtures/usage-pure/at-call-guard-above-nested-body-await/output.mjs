import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// the parking points of a body are its OWN: an `await` written inside a body nested in it belongs to
// that nested body, and an async function carrying none of its own runs whole at its call, so the
// guard above the read holds. the same `await` written in the host body parks it, and both families
// inject
export function nestedBodyAwait(v, extra) {
  let x = v;
  async function read() {
    if (typeof x === 'string') {
      const later = async () => {
        await 0;
      };
      void later;
      return _includesMaybeString(x).call(x, 'a');
    }
    return null;
  }
  const done = read();
  x = extra;
  return done;
}
export function hostBodyAwait(v, extra) {
  let y = v;
  async function read() {
    if (typeof y === 'string') {
      await 0;
      return _at(y).call(y, 0);
    }
    return null;
  }
  const done = read();
  y = extra;
  return done;
}