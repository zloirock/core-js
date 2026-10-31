// every host destructuring a selection with a call arm reads what the call returns raw: an assignment, a
// parameter default, a level nested below the host's own and a for-of head take the returned constructor's
// whole entry in pure and its static's module in usage-global
function pickMap() { try { probe(); } catch {} return Map; }
function pickPromise() { try { probe(); } catch {} return Promise; }
function pickIterator() { try { probe(); } catch {} return Iterator; }
function pickUrl() { try { probe(); } catch {} return URL; }
let groupBy;
({ groupBy } = pickMap() || Set);
export function settle({ try: attempt } = pickPromise() || WeakMap) { return attempt; }
const { inner: { from } } = { inner: pickIterator() || WeakSet };
for (const { canParse } of [pickUrl() || Reflect]) use(canParse);
export { groupBy, from };
