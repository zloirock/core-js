import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref6;
// REF-ORDER: memo temporaries are numbered by the top-down walk, so an OUTER site takes a lower
// suffix than a site nested inside its own receiver argument - an innermost-first allocator would
// swap the two. hoisting a declaration into a function body reorders the printed `var` lines
// without touching the numbering, and both emitters have to agree on the whole sequence
export const a = _at(_ref = p(_at(_ref2 = q()).call(_ref2, 0))).call(_ref, 1);
export const b = _at(_ref3 = _at(_ref4 = c()).call(_ref4, 0).d()).call(_ref3, 1);
export function h() {
  var _ref5;
  return _at(_ref5 = k()).call(_ref5, 0);
}
export const e = _at(_ref6 = g()).call(_ref6, 0);