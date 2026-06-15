import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// statics that return their first argument unchanged (Object.freeze / seal / setPrototypeOf, etc.)
// keep the argument's container type, so a method call on the frozen-constant binding substitutes the
// array-specific receiver-less helper. Object.fromEntries returns a NEW plain object (no such flag),
// so a read on its result stays native. two array-narrow methods so each import is distinct.
const FROZEN = Object.freeze(["a", "b"]);
_includesMaybeArray(FROZEN).call(FROZEN, "a");
const SEALED = Object.seal([1, 2]);
_atMaybeArray(SEALED).call(SEALED, 0);
const ENTRIES = _Object$fromEntries([["k", 1]]);
ENTRIES.includes(1);