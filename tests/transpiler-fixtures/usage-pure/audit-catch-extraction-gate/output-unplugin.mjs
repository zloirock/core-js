import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
// the catch receiver extraction fires only when a pattern prop will actually be
// rewritten; everything else destructures in place
// a non-polyfillable name stays in place even when the body references it
try { f1(); } catch ({ message }) { use(_at(message).call(message, 0)); }
// a polyfillable key referenced in the body extracts (`flatMap = dispatcher(_ref)`)
try { f2(); } catch (_ref) {
let flatMap = _flatMapMaybeArray(_ref); use(flatMap); }
// a polyfillable key with NO body reference stays in place
try { f3(); } catch ({ findLast }) { use(2); }
// a plain default stays in place; a default on a polyfillable key extracts
try { f4(); } catch ({ code = 1 }) { use(code); }
try { f5(); } catch (_ref2) {
let _ref4, entries = (_ref4 = _entries(_ref2)) === void 0 ? fb : _ref4; use(entries); }
// rest alone stays in place; rest beside a polyfillable sibling extracts (sentinel)
try { f6(); } catch ({ reason, ...restA }) { use(restA); }
try { f7(); } catch (_ref3) {
let toSorted = _toSortedMaybeArray(_ref3);
let { toSorted: _unused, ...restB } = _ref3; use(restB); }
// a nested pattern's leaf is a local binding, not a polyfill candidate - stays in place
try { f8(); } catch ({ data: { at } }) { use(at); }