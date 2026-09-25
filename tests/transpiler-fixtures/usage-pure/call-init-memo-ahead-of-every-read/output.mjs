import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a pattern reading a static and an instance member off a CALL memoizes the call once, and the memo
// stands ahead of every read of it: behind a sibling declarator whose init runs first, and in a loop
// head - the one host without a statement slot, where a lone instance reader still takes the memo
// rather than spelling the call a second time
function mkIterator() {
  log();
  return _Iterator;
}
function mkMap() {
  log();
  return _Map;
}
function mkObject() {
  log();
  return Object;
}
function mkPromise() {
  log();
  return _Promise;
}
const z = 1;
const _ref = mkIterator();
const fromIterator = _Iterator$from;
const iteratorName = _nameMaybeFunction(_ref);
for (const _ref2 = mkMap(), fromMap = _Map$groupBy, mapName = _nameMaybeFunction(_ref2);;) break;
for (let _ref3 = mkObject(), fromObject = _Object$fromEntries, objectName = _nameMaybeFunction(_ref3), i = 0; i < 1; i++) use(fromObject, objectName);
for (var _ref4 = mkPromise(), fromPromise = _Promise$try, promiseName = _nameMaybeFunction(_ref4);;) break;
use(z, fromIterator, iteratorName, fromPromise, promiseName);