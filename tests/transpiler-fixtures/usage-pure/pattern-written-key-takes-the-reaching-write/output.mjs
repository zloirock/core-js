import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a key a pattern writes takes the value of the write that reaches the read, as one only plain writes reach
// does - in either order of the pattern and the plain write, through a hoisted `var` and a parameter alike.
// what a pattern writes is the slot it names (`iterator` off `Symbol`), so a later write of another symbol
// is what the read sees, and a write on one path only leaves no single value - those reads stay native
let patternFirst;
patternFirst = _Symbol$iterator;
patternFirst = _Symbol$iterator;
export const readPatternFirst = target => _getIteratorMethod(target);
let plainFirst;
plainFirst = _Symbol$iterator;
plainFirst = _Symbol$iterator;
export const readPlainFirst = target => _getIteratorMethod(target);
var hoisted;
hoisted = _Symbol$asyncIterator;
hoisted = _Symbol$iterator;
export const readHoisted = target => _getIteratorMethod(target);
export function readParameter(target, key) {
  key = _Symbol$iterator;
  return _getIteratorMethod(target);
}
let replaced;
replaced = _Symbol$iterator;
replaced = _Symbol$asyncIterator;
export const readReplaced = target => target[replaced];
let oneArm;
oneArm = _Symbol$iterator;
if (flag) oneArm = _Symbol$asyncIterator;
export const readOneArm = target => target[oneArm];