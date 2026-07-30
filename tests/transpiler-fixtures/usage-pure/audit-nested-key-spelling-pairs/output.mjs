import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// walking a nested pattern to its receiver pairs each nesting key against the host literal's own key.
// both sides must name the slot the same way the language does: comparing raw literal VALUES puts the
// number 0 against the string '0', so a pattern and a literal that spell one slot differently failed
// to pair and the polyfill was lost on a receiver whose value was right there. pure-only on purpose:
// usage-global injects off the plain usage regardless of the pairing, so a global twin would pass
// with the defect in place
const sameNumeric = _atMaybeArray([1, 2]);
const numericPatternStringHost = _flatMaybeArray([3, [4]]);
const stringPatternNumericHost = _findLastMaybeArray([5, 6]);
const namedKey = _entriesMaybeArray([7, 8]);
export { sameNumeric, numericPatternStringHost, stringPatternNumericHost, namedKey };