// a pattern reading a static and an instance member off a CALL memoizes the call once, and the memo
// stands ahead of every read of it: behind a sibling declarator whose init runs first, and in a loop
// head - the one host without a statement slot, where a lone instance reader still takes the memo
// rather than spelling the call a second time
function mkIterator() { log(); return Iterator; }
function mkMap() { log(); return Map; }
function mkObject() { log(); return Object; }
function mkPromise() { log(); return Promise; }
const z = 1, { from: fromIterator, name: iteratorName } = mkIterator();
for (const { groupBy: fromMap, name: mapName } = mkMap(); ;) break;
for (let { fromEntries: fromObject, name: objectName } = mkObject(), i = 0; i < 1; i++) use(fromObject, objectName);
for (var { try: fromPromise, name: promiseName } = mkPromise(); ;) break;
use(z, fromIterator, iteratorName, fromPromise, promiseName);
