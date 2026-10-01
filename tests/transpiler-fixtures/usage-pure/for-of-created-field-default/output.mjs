import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A write can create a field absent from the named holder's initializer.
// The nested default remains guarded; its array type cannot describe the supplied string.
const row = {};
row.w = '02';
for (const _ref2 of [row]) {
  var _ref;
  const _ref3 = (_ref = _ref2.w) === void 0 ? [0, 2] : _ref;
  const at = _at(_ref3);
  const includes = _includes(_ref3);
  use(at.call('02', -1), includes.call('02', '02'));
}