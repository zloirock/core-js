import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `for await` parks on every iteration while carrying no `await` node of its own, so the loop itself
// is the position a guard above it goes stale at and both families inject. a plain `for-of` in the
// same slot parks nowhere and the guard above it still holds
export function afterForAwait(v, extra, steps) {
  let x = v;
  async function read() {
    if (typeof x === 'string') {
      for await (const step of steps) void step;
      return _at(x).call(x, 0);
    }
    return null;
  }
  const done = read();
  x = extra;
  return done;
}
export function afterForOf(v, extra, steps) {
  let y = v;
  async function read() {
    if (typeof y === 'string') {
      for (const step of steps) void step;
      return _includesMaybeString(y).call(y, 'a');
    }
    return null;
  }
  const done = read();
  y = extra;
  return done;
}