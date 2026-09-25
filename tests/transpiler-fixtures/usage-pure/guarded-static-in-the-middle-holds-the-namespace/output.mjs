import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a static read off a CONDITIONALLY reassigned name in the MIDDLE of a pattern gets no identity guard
// (the render guards a sole slot or a pattern end only): the census holds the constructor's namespace
// for it instead, in a declaration and an assignment, while a pattern end keeps its guard
let M = _Map;
if (n) M = {
  groupBy: 7,
  name: 'x'
};
const nm1 = _nameMaybeFunction(M);
const {
  a1,
  groupBy: s1
} = M;
let P = _Promise;
if (n) P = {};
let a2, t2, nm2;
nm2 = _nameMaybeFunction(P);
({
  a2,
  try: t2
} = P);
let I = _Iterator;
if (n) I = {};
const nm3 = _nameMaybeFunction(I);
const f3 = I === _Iterator ? _Iterator$from : I.from;
use(a1, s1, nm1, a2, t2, nm2, nm3, f3);