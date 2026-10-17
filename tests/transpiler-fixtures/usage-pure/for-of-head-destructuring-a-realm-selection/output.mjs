import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// A nested instance read dispatches on the actual iterated receiver.
// Unplugin also mirrors the realm arm's static; Babel retains the native `of` read.
for (const _ref2 of [c ? _globalThis : fb]) {
  const {
    Array: _ref
  } = _ref2;
  const at = _at(_ref.prototype),
    {
      of
    } = _ref;
  use(at, of);
}