// a pattern reading a static and an instance member off a value it must evaluate once - a call, a
// getter, a sequence ending in either - memoizes that value AHEAD of both reads: the static binds its
// polyfill, the instance member dispatches on the memo, and no read precedes the memo's declaration
function make() { return Map; }
const { groupBy: fromCall, name: callName } = make();
class Holder { static get made() { return Promise; } }
const { try: fromGetter, name: getterName } = Holder.made;
let n = 0;
const { from: fromSequence, name: sequenceName } = (n++, make2());
function make2() { return Iterator; }
use(fromCall, callName, fromGetter, getterName, fromSequence, sequenceName, n);
