// `for await` parks on every iteration while carrying no `await` node of its own, so the loop itself
// is the position a guard above it goes stale at and both families inject. a plain `for-of` in the
// same slot parks nowhere and the guard above it still holds
export function afterForAwait(v, extra, steps) {
  let x = v;
  async function read() {
    if (typeof x === 'string') {
      for await (const step of steps) void step;
      return x.at(0);
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
      return y.includes('a');
    }
    return null;
  }
  const done = read();
  y = extra;
  return done;
}
