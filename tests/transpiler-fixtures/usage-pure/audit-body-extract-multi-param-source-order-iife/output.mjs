import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// two function params each carrying a polyfilled prop + rest sibling - both bail to body-extract.
// the emitted `let from` / `let keys` must follow SOURCE order, not the reverse order a fixed
// body-top anchor would stack them in, matching unplugin byte-for-byte. immediately-invoked twin:
// the lossy emission is sound because the single call site is visible.
(function run({
  from: _unused,
  ...rest1
} = Array, {
  keys: _unused2,
  ...rest2
} = Object) {
  let from = _Array$from;
  let keys = _Object$keys;
  return [from([1]), keys({}), rest1, rest2];
})();