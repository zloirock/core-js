// the enclosing-body walk goes THROUGH a body that runs at its own immediate invocation, so a read
// the async function reaches inside such a call below the `await` is still read after the parking
// point and both families inject. the same call standing above it runs before the caller's write
export function iifeBelowAwait(v, extra) {
  let x = v;
  async function read() {
    if (typeof x === 'string') {
      await 0;
      return (() => x.at(0))();
    }
    return null;
  }
  const done = read();
  x = extra;
  return done;
}
export function iifeAboveAwait(v, extra) {
  let y = v;
  async function read() {
    if (typeof y === 'string') {
      const first = (() => y.includes('a'))();
      await 0;
      return first;
    }
    return null;
  }
  const done = read();
  y = extra;
  return done;
}
