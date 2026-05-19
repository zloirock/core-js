import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
// switch-case discriminant narrow on `w.kind`. each case consequent narrows `w`
// to its branch (case 'a' -> data:string, case 'b' -> data:number[]). the
// `current.listKey === 'consequent'` gate keeps the case narrow scoped to body
// positions - a use sitting in a sibling case's TEST slot wouldn't see this
// narrow, because the case body runs only after the discriminator commits
type Shape = {
  kind: 'a';
  data: string;
} | {
  kind: 'b';
  data: number[];
};
declare const w: Shape;
switch (w.kind) {
  case 'a':
    _atMaybeString(_ref = w.data).call(_ref, 0);
    break;
  case 'b':
    _atMaybeArray(_ref2 = w.data).call(_ref2, 0);
    break;
}