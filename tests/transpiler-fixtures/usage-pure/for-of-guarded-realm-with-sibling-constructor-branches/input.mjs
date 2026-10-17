// The local true guard makes the realm element the only reachable loop value. Pure extraction serves
// Array.of and Object.keys while the opaque key still reads the actual Array object. The unknown guard
// remains explicit in `for-of-head-destructuring-a-realm-selection`: Babel native, unplugin mirrored.
let enabled = true;
const key = String(Math.random() > 2);
for (const { Array: { of, [key]: extra }, Object: { keys } } of [enabled && globalThis]) {
  use(of, keys, extra);
}
