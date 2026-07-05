import _at from "@core-js/pure/actual/instance/at";
// `typeof r === 'object'` keeps null at runtime, so the guard-narrowed union survivor is
// marked: `??` inside the branch may still yield the string fallback and must dispatch
// generically, not through an array-Maybe
declare const r: number[] | null;
if (typeof r === 'object') {
  var _ref;
  _at(_ref = r ?? 'fallback').call(_ref, 0);
}