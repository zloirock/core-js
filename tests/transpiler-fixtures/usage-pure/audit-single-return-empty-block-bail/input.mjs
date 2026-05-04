// empty BlockStatement body - no ReturnStatement, `singleReturnBodyExpression` returns null,
// receiver resolution bails. caller's `.from` / `.intersection` cannot be linked to a known
// constructor; no polyfill fires for these member accesses (unrelated raw `Array.from(...)`
// elsewhere still polyfills normally to confirm the runner is wired).
const empty1 = (() => {})().from([1]);
const empty2 = (() => {})().prototype.intersection;
const baseline = Array.from([2]);
export { empty1, empty2, baseline };
