import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a write buried in a switch-DISCRIMINANT closure targets the OUTER binding (the discriminant
// evaluates before the case-block scope exists) and may run: the string narrow must widen to the
// generic helper - a kept string-specific helper is the wrong variant once the callback retypes
// the value to an array. the shadow WITHOUT a discriminant write keeps the narrow
export function widens(mk) {
  let x = "ab";
  switch (mk(() => {
    x = [5];
  })) {
    case 1:
      let x = 0;
      mk(x);
  }
  return _at(x).call(x, 0);
}
export function keepsNarrow(mk) {
  let y = "cd";
  switch (mk(1)) {
    case 1:
      let y = 0;
      mk(y);
  }
  return _includesMaybeString(y).call(y, "c");
}