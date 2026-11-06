import _at from "@core-js/pure/actual/instance/at";
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