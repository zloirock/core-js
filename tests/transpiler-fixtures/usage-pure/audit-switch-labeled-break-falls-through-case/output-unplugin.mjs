import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `outer: { break outer; }` exits ONLY the labeled wrapper, not the switch -
// control falls through to the next case. previously canFallThrough mis-classified
// the case as switch-exit because BreakStatement is in EXIT_STATEMENTS without a
// label-scope check, leading to an unsound discriminant narrow at the fall-through
// case body. with the label-tracking fix the case stays fall-through and the next
// case sees the union receiver (string | number[]), so .at(0) emits the generic
// instance polyfill rather than the array narrow
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