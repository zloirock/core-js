import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a NESTED instance claim whose chain NAVIGATES INTO a built-in surface: the dispatch reads what the
// hops NAME (`_globalThis.Array.prototype`), not the root the init spells. both legs print this file
// identically - it carries no sidecar, and a sidecar appearing here IS the regression
const fromGlobal = _flatMaybeArray(_globalThis.Array.prototype);
const fromCtor = _atMaybeArray(Array.prototype);
const fromNav = _includesMaybeArray(_globalThis.Array.prototype); // the FOR-INIT row drops its slot like any other: what the drop needs is a DECLARATOR slot, not a
// statement one, and the header has that - the extraction stands where the residual did. a LITERAL
// receiver keeps its residual there instead (`audit-destructure-nested-instance-for-init-no-memo`),
// because nothing resolved a surface to read twice
let inLoop;
for (const loopBound = _findLastMaybeArray(_globalThis.Array.prototype); !inLoop;) inLoop = typeof loopBound;
// a DEFAULTED leaf keeps its guard: the dispatch answers `it.method` verbatim off a foreign surface
const defaulted = (_ref = _toSortedMaybeArray(_globalThis.Array.prototype)) === void 0 ? null : _ref; // the SYMBOL leaf under the same surface rides the same route: its receiver is that surface, not the
// object above it
const symLeaf = _getIteratorMethod(_globalThis.Array.prototype); // NEGATIVE: a chain of pristine proxy names peels away entirely and reads the ROOT itself, where the
// native slot stands - `keys` off the global object is not a claim on a polyfilled surface
const {
  keys: offRoot
} = _globalThis;
// NEGATIVE: a chain that STOPS at the object it reaches is a name match, not a surface - `keys` off
// the Array constructor binds undefined natively. the ASSIGNMENT host asks the same question
const {
  keys: onCtor
} = _globalThis.Array;
let onCtorAssign;
({
  keys: onCtorAssign
} = _globalThis.Array);
export { fromGlobal, fromCtor, fromNav, inLoop, defaulted, symLeaf, offRoot, onCtor, onCtorAssign };