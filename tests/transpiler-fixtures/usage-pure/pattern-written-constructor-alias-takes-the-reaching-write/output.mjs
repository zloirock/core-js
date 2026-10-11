import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a constructor alias a pattern writes takes the write that reaches the read, as one only plain writes reach
// does: the last of a pattern and a plain write, or of two patterns naming different constructors, and the
// one in the arm a presence test the build answers always takes, decide which static the read narrows to. a
// write on one path only leaves the value to the runtime guard, testing every constructor written there
let patternFirst;
patternFirst = _Promise;
patternFirst = _Map;
export const groups = _Map$groupBy([1, 2], x => x % 2);
let twoPatterns;
twoPatterns = _Map;
twoPatterns = _Promise;
export const settled = _Promise$allSettled([]);
let decided;
if (_globalThis) decided = _Promise;
export const tried = _Promise$try(() => 1);
let oneArm;
({
  Array: oneArm
} = _globalThis);
if (flag) oneArm = _Iterator;
export const copied = (oneArm === _Iterator ? _Iterator$from : oneArm === Array ? _Array$from : oneArm.from.bind(oneArm))([3]);