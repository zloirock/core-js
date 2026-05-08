import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// combination: for-init with nested proxy-global destructure + comma-expression head
// + body reads the destructured binding. for-init can't host a lifted statement outside
// the loop header, so the comma-expression migrates into a sibling sink declarator within
// the same declaration; the polyfill is extracted as `from = _polyfill` so it always wins
// regardless of native receiver field
function se() {
  return _globalThis;
}
for (const from = _Array$from, _unused = (se(), _globalThis); false;) from([]);