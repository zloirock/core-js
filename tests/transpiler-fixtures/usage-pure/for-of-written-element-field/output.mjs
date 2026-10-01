import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A loop element's named holder keeps field writes visible to nested instance reads.
// The current string value must not use its initializer's array dispatch or a dead default.
const row = {
  w: [0, 2]
};
row.w = '02';
for (const _ref of [row]) {
  const _ref2 = _ref.w;
  const at = _at(_ref2);
  const includes = _includes(_ref2);
  use(at.call('02', -1), includes.call('02', '02'));
}