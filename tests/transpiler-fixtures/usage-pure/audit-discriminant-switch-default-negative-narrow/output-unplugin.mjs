import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// default-case discriminant narrow emits NEGATIVE guards for each explicit case
// value (`{field:'kind', value:'a', positive:false}` etc.). filtered to the
// branches not matched by any explicit case - here 'a' / 'b' are excluded, only
// 'c' survives. without negative-guard emission the default body would see the
// unrefined union; with it, `.at()` dispatches against the surviving branch's
// resolved member type
type Shape =
  | { kind: 'a'; data: number[] }
  | { kind: 'b'; data: number[] }
  | { kind: 'c'; data: string };
declare const w: Shape;
switch (w.kind) {
  case 'a':
    break;
  case 'b':
    break;
  default:
    _atMaybeString(_ref = w.data).call(_ref, 0);
    break;
}