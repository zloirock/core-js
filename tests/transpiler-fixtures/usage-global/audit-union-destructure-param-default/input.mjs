// a param-default host (`function f({ from } = M)`) supplies the destructure union's receiver
// axis like a declarator init does: a reassigned receiver alias unions its reachable ctor, so
// the alternative's static earns its side-effect import too
var M = [1];
if (globalThis.cond) M = Iterator;
export function f({ from } = M) { return from; }
// the arrow twin of the param-default host; the binding lives in an OUTER scope, so the
// reassignment enumerator anchors its search at the binding's scope, not the param scope
var N = [1];
if (globalThis.cond) N = Map;
export const g = ({ groupBy } = N) => groupBy;
