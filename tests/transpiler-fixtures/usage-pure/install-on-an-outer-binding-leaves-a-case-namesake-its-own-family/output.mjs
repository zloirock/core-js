import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// a switch's discriminant reads the binding outside the switch, not a namesake its cases declare: a
// dispatching prototype installed there leaves the case's array the array family
let a = {};
switch (Object.setPrototypeOf(a, String.prototype), k) {
  case 1:
    let a = [1, 2];
    use(_includesMaybeArray(a).call(a, 2));
}