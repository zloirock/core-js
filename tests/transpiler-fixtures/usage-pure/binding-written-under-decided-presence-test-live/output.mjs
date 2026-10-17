import _Promise from "@core-js/pure/actual/promise/constructor";
// A binding written under a presence test this build always answers takes the type the test
// settles, braced or not: a write in the arm the build always takes is unconditional, one in the
// arm it never takes leaves the value before it. An undecided test keeps both values, and so does
// a `||` over an alias of a global the build does not know, which may hold a falsy value.
export function live() {
  let value = [1];
  if (typeof _Promise != 'undefined') value = 'abc';
  return value.slice(1);
}