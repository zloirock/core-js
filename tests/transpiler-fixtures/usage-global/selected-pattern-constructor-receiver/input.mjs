// Pair the pattern with both selected sources: a user slot and the realm constructor.
// The user method is preserved, and only the realm branch needs the static polyfill.
function read(flag) {
  let C;
  const own = { Map: { groupBy: 9 } };
  const source = ({ Map: C } = flag ? own : globalThis);
  return [source === (flag ? own : globalThis), typeof C.groupBy];
}
export const result = [read(true), read(false)];
