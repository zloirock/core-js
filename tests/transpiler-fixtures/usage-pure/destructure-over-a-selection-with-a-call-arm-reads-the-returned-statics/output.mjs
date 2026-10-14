import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _URL from "@core-js/pure/actual/url";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a destructure over a selection whose arm is a call leaves the read raw over what that call returns:
// pure takes the returned constructor's whole entry and usage-global loads the static its key names,
// whichever operator selects and on whichever side the call stands. a call whose body is one return
// decides the selection and is served by name instead (last row)
function pickMap() {
  try {
    probe();
  } catch {}
  return _Map;
}
function pickPromise() {
  try {
    probe();
  } catch {}
  return _Promise;
}
function pickIterator() {
  try {
    probe();
  } catch {}
  return _Iterator;
}
function pickUrl() {
  try {
    probe();
  } catch {}
  return _URL;
}
function single() {
  return _Symbol;
}
const {
  groupBy
} = pickMap() || _Set;
const {
  try: attempt
} = flag ? _WeakMap : pickPromise();
const {
  from
} = (0, pickIterator()) ?? _WeakSet;
const {
  canParse
} = flag && pickUrl();
const asyncIterator = _Symbol$asyncIterator;
export { groupBy, attempt, from, canParse, asyncIterator };