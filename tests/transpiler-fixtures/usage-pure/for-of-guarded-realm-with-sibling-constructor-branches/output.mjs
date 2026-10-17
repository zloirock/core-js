import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// The local true guard makes the realm element the only reachable loop value. Pure extraction serves
// Array.of and Object.keys while the opaque key still reads the actual Array object. The unknown guard
// remains explicit in `for-of-head-destructuring-a-realm-selection`: Babel native, unplugin mirrored.
let enabled = true;
const key = String(Math.random() > 2);
for (const _ref of [enabled && _globalThis]) {
  const of = _Array$of;
  const keys = _Object$keys;
  const {
    Array: {
      [key]: extra
    }
  } = _ref;
  use(of, keys, extra);
}