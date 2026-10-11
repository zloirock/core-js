import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// an assignment its claims empty lifts what its init still runs as one statement, less the dead tail: the
// literal the pattern read does no work, and of a selection the build decides only the part that runs lifts
let at, flat;
log('at');
at = _atMaybeArray([]);
log('flat');
flat = _flatMaybeArray([]);
export { at, flat };