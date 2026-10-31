// a destructure over a selection whose arm is a call leaves the read raw over what that call returns:
// pure takes the returned constructor's whole entry and usage-global loads the static its key names,
// whichever operator selects and on whichever side the call stands. a call whose body is one return
// decides the selection and is served by name instead (last row)
function pickMap() { try { probe(); } catch {} return Map; }
function pickPromise() { try { probe(); } catch {} return Promise; }
function pickIterator() { try { probe(); } catch {} return Iterator; }
function pickUrl() { try { probe(); } catch {} return URL; }
function single() { return Symbol; }
const { groupBy } = pickMap() || Set;
const { try: attempt } = flag ? WeakMap : pickPromise();
const { from } = (0, pickIterator()) ?? WeakSet;
const { canParse } = flag && pickUrl();
const { asyncIterator } = single() || {};
export { groupBy, attempt, from, canParse, asyncIterator };
