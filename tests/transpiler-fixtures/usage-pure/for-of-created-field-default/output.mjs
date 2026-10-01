import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A write can create a field absent from the named holder's initializer.
// The nested default remains guarded; its array type cannot describe the supplied string.
const row = {};
row.w = '02';
for (const _ref2 of [row]) {
  const {
      w: _ref = [0, 2]
    } = _ref2,
    at = _at(_ref),
    includes = _includes(_ref);
  use(at.call('02', -1), includes.call('02', '02'));
}