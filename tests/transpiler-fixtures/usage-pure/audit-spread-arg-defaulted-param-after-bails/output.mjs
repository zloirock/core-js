import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a spread argument has unknown length, so a defaulted param at/after the spread slot may be
// supplied by the spread OR take its default - ambiguous, so the call result bails to the generic helper
declare const arr: string[];
function f(a: unknown, b = [1, 2, 3]) {
  return b;
}
// @ts-expect-error a spread argument tsc cannot place is the shape under test
_at(_ref = f(...arr)).call(_ref, 0);