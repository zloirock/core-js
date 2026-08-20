// AssignmentExpression cascade: `({Array: {from}, ...rest} = globalThis);` - rest sibling
// in OUTER pattern triggers cascade path with `_unused` sentinel for the polyfilled key
// to preserve rest exclusion semantics. tests cascade-assignment expression handler with hasRest
let from, rest;
({ Array: { from }, ...rest } = globalThis);
export { from, rest };
