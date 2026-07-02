import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// default-case discriminant narrow emits a NEGATIVE guard on `kind` for each explicit case
// value, so the default body only sees branches no explicit case matched - here 'a' / 'b'
// are excluded and only 'c' survives. without the negative guards the default would see the
// unrefined union; with them `.at()` dispatches against the surviving branch's member type.
type Shape = {
  kind: 'a';
  data: number[];
} | {
  kind: 'b';
  data: number[];
} | {
  kind: 'c';
  data: string;
};
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