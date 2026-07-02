// a spread argument has unknown length, so a defaulted param at/after the spread slot may be
// supplied by the spread OR take its default - ambiguous, so the call result bails to the generic helper
declare const arr: string[];
function f(a: unknown, b = [1, 2, 3]) {
  return b;
}
f(...arr).at(0);
