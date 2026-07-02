import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
setup(() => {
  try {
    run();
  } catch (_ref2) {
    let flat = _flatMaybeArray(_ref2);
    flat([1]);
  }
});
// a destructured static (`from`) whose receiver sits behind a side-effect prefix that holds a
// catch clause binding an instance-method name: the catch-clause rewrite must be relocated into
// the lifted prefix text, not left anchored where the static extraction overwrites the whole
// declaration. both flavors emit the catch-bound instance polyfill; outputs differ only in
// codegen - babel drops the now-dead `Array` tail, unplugin keeps it - see output-unplugin.mjs
const from = _Array$from;
from([1, 2, 3]);