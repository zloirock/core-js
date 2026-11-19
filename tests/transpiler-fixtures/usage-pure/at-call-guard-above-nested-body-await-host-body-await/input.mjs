export function hostBodyAwait(v, extra) {
  let y = v;
  async function read() {
    if (typeof y === 'string') {
      await 0;
      return y.at(0);
    }
    return null;
  }
  const done = read();
  y = extra;
  return done;
}
