import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
// the catch receiver extraction fires only when a pattern prop will actually be
// rewritten; everything else destructures in place
// a non-polyfillable name stays in place even when the body references it
try {
  f1();
} catch ({
  message
}) {
  use(_at(message).call(message, 0));
}
// a polyfillable key referenced in the body extracts (`flatMap = dispatcher(_ref)`)
try {
  f2();
} catch (_ref) {
  let flatMap = _flatMapMaybeArray(_ref);
  use(flatMap);
}
// a polyfillable key with NO body reference stays in place
try {
  f3();
} catch ({
  findLast
}) {
  use(2);
}
// a plain default stays in place; a default on a polyfillable key extracts
try {
  f4();
} catch ({
  code = 1
}) {
  use(code);
}
try {
  f5();
} catch (_ref2) {
  let _ref3,
    entries = (_ref3 = _entries(_ref2)) === void 0 ? fb : _ref3;
  use(entries);
}
// rest alone stays in place; rest beside a polyfillable sibling extracts (sentinel)
try {
  f6();
} catch ({
  reason,
  ...restA
}) {
  use(restA);
}
try {
  f7();
} catch (_ref4) {
  let toSorted = _toSortedMaybeArray(_ref4);
  let {
    toSorted: _unused,
    ...restB
  } = _ref4;
  use(restB);
}
// a nested pattern's leaf IS a candidate - the key above it names no member, the claim sits below
// it, and what the relocation buys is the declaration host its route needs. the receiver is
// unknown here, so the dispatcher it gets is the generic one
try {
  f8();
} catch (_ref5) {
  let at = _at(_ref5.data);
  use(at);
}
// ... and a leaf with SIBLINGS relocates too: what the relocation buys is the declaration host,
// and every claim below the prop takes it whatever else the pattern binds - the sibling rides
// along in the residual, reading the same memo the claim was extracted from
try {
  f9();
} catch (_ref6) {
  const _ref7 = _ref6.data;
  let a2 = _at(_ref7);
  let {
    length
  } = _ref7;
  use(a2, length);
}