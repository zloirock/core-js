// A constructor a builtin inserts through a detached invoker - `.call`, `.apply` - keeps the same
// conservative injection the direct spelling gets, so the later slot read finds its static.
// one constructor per spelling
const b = [];
b.push.call(b, Map);
const viaCall = typeof b[0].groupBy;
const c = [];
c.push.apply(c, [Promise]);
const viaApply = typeof c[0].try;
export { viaCall, viaApply };
