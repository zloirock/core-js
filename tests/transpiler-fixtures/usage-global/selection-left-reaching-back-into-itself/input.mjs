// A `||` / `??` whose left reaches back into the selection it is the left of - a call returning the binding
// that selection initializes - decides nothing: the slot is not written yet when its initializer runs, so
// the right runs and keeps its modules, bare or read off the realm alike.
function getMap() { return byBare; }
var byBare = getMap() || Map;
export const grouped = byBare.groupBy(list, key);
function getPromise() { return byRealm; }
var byRealm = getPromise() ?? globalThis.Promise;
export const tried = byRealm.try(task);
