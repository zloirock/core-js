// A constructor a builtin inserts through a detached invoker - `.call`, `.apply` - needs no full
// namespace, as with the direct spelling: pure leaves the later slot read native, following a value
// a builtin installed being deferred. one constructor per spelling
const b = [];
b.push.call(b, Map);
const viaCall = typeof b[0].groupBy;
const c = [];
c.push.apply(c, [Promise]);
const viaApply = typeof c[0].try;
export { viaCall, viaApply };
