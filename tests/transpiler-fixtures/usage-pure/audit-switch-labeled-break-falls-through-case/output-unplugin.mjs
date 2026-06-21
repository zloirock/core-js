import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `outer: { break outer; }` exits ONLY the labeled wrapper, not the switch - control falls
// through to the next case. a labelled BreakStatement must NOT be classified as a switch-exit
// (a label-scope check is required), else the next case is unsoundly narrowed. with the case
// staying fall-through the next case sees the union (string | number[]), so .at(0) emits the
// generic instance polyfill, not the array narrow.
type Shape = { kind: 'a'; data: string } | { kind: 'b'; data: number[] };
declare const w: Shape;
switch (w.kind) {
  case 'a':
    outer: {
      break outer;
    }
  case 'b':
    _at(_ref = w.data).call(_ref, 0);
}