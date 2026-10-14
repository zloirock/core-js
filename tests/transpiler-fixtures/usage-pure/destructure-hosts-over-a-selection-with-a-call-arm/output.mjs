import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Set from "@core-js/pure/actual/set/constructor";
import _URL from "@core-js/pure/actual/url";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// every host destructuring a selection with a call arm reads what the call returns raw: an assignment, a
// parameter default, a level nested below the host's own and a for-of head take the returned constructor's
// whole entry in pure and its static's module in usage-global
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
let groupBy;
({
  groupBy
} = pickMap() || _Set);
export function settle({
  try: attempt
} = pickPromise() || _WeakMap) {
  return attempt;
}
const {
  inner: {
    from
  }
} = {
  inner: pickIterator() || _WeakSet
};
for (const {
  canParse
} of [pickUrl() || _Reflect]) use(canParse);
export { groupBy, from };