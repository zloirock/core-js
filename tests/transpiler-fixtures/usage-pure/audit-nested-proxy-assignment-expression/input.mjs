// `({Array: {from}} = globalThis)` in ExpressionStatement - AssignmentExpression value
// is discarded by surrounding statement, so flatten replaces with direct `from = _Array$from;`
// (polyfill always wins). inline-default `{from = _Array$from}` would pick native first on
// modern engines (`globalThis.Array.from` defined natively), contradicting usage-pure's
// "polyfill always wins" contract. AssignmentExpression in non-ExpressionStatement context
// (`console.log({Array:{from}} = G)`) bails - value is observable, can't safely transform
let from;
({ Array: { from } } = globalThis);
export const arr = from([1, 2, 3]);
